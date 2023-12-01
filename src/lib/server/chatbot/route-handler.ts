import { NextRequest } from 'next/server';
import isBot from 'isbot';
import { StreamingTextResponse } from 'ai';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

import generateReplyFromChain, { insertConversationMessages } from './langchain';
import getSupabaseRouteHandlerClient from '~/core/supabase/route-handler-client';
import getVectorStore from '~/lib/server/chatbot/vector-store';
import { Database } from '~/database.types';
import { CHATBOTS_TABLE } from '~/lib/db-tables';
import { getConversationIdHeaderName } from '~/lib/chatbots/conversion-cookie-name';
import { insertConversation } from '~/lib/chatbots/mutations';

const CONVERSATION_ID_STORAGE_KEY = getConversationIdHeaderName();

// Set this to true to use a fake data streamer for testing purposes.
let USE_FAKE_DATA_STREAMER = false;

if (process.env.NODE_ENV === 'production') {
  // make sure to set this to false in production
  USE_FAKE_DATA_STREAMER = false;
}

/**
 * Handles a chat bot request. This function should be exported from a
 * Next.js App Router route handler as a POST request.
 *
 * @example
 * file: app/api/chat/route.ts
 *
 * export const POST = handleChatBotRequest;
 *
 * */
export function handleChatBotRequest({ responseHeaders }: {
  responseHeaders: Record<string, string>;
}) {
  return async function (req: NextRequest) {
    const userAgent = req.headers.get('user-agent');

    if (isBot(userAgent)) {
      return new Response(`No chatbot for you!`, {
        status: 403,
      });
    }

    // we parse the request body to get the messages sent by the user
    const zodSchema = z.object({
      messages: z.array(
        z.object({
          content: z.string(),
          role: z.enum(['user', 'assistant'] as const),
        }),
      ),
    });

    const chatbotId = z.string().uuid().parse(req.headers.get('x-chatbot-id'));
    const { messages } = zodSchema.parse(await req.json());

    const conversationReferenceId = req.headers.get(
      CONVERSATION_ID_STORAGE_KEY,
    );

    // if the user is using the fake data streamer, we return a fake response
    if (USE_FAKE_DATA_STREAMER) {
      return fakeDataStreamer();
    }

    const client = getSupabaseRouteHandlerClient({
      admin: true,
    });

    const canGenerateAIResponse = await client.rpc('can_respond_to_message', {
      chatbot: chatbotId,
    });

    const filter = {
      chatbot_id: chatbotId,
    };

    if (!conversationReferenceId) {
      throw new Error(
        `Missing conversation reference id in request headers: ${CONVERSATION_ID_STORAGE_KEY}`,
      );
    }

    // if it's the first message we insert a new conversation
    if (messages.length <= 2) {
      await insertConversation(client, {
        chatbotId,
        conversationReferenceId,
      });
    }

    // if the Organization can't generate an AI response, we use a normal search
    if (!canGenerateAIResponse.data) {
      const latestMessage = messages[messages.length - 1];

      // in this case, use a normal search function
      const { text, stream } = await searchDocuments({
        client,
        query: latestMessage.content,
        filter,
      });

      await insertConversationMessages({
        client,
        chatbotId,
        conversationReferenceId,
        text,
        previousMessage: latestMessage.content,
      });

      return new StreamingTextResponse(stream);
    }

    const siteName = await getChatbotSiteName(client, chatbotId);

    const stream = await generateReplyFromChain({
      client,
      messages,
      chatbotId,
      siteName,
      conversationReferenceId,
    });

    return new StreamingTextResponse(stream, {
      headers: responseHeaders,
    });
  };
}

export default handleChatBotRequest;

async function searchDocuments(params: {
  client: ReturnType<typeof getSupabaseRouteHandlerClient>;
  query: string;
  filter: {
    chatbot_id: string;
  };
}) {
  const { client, filter, query } = params;
  const store = await getVectorStore(client);

  const documents = await store
    .asRetriever({
      filter,
    })
    .getRelevantDocuments(query);

  const content = documents
    .map((document) => {
      return `<a target='_blank' class='document-link' href="${document.metadata.url}">${document.metadata.title}</a>`;
    })
    .join('\n\n');

  const contentResponse = `I found these documents that might help you:\n\n${content}`;
  const text = documents.length ? contentResponse : 'Sorry, I was not able to find an answer for you.';

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(text);
      controller.close();
    },
  });

  return {
    stream,
    text,
  }
}

/**
 * @returns {Response} - A fake data streamer response.
 */
function fakeDataStreamer() {
  let timerId: number | undefined;
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      // @ts-ignore
      timerId = setInterval(() => {
        if (closed) return;

        controller.enqueue(encoder.encode('TEXT'));
      }, 200);

      setTimeout(() => {
        controller.close();
        closed = true;
      }, 5_000);
    },
    cancel() {
      if (typeof timerId === 'number') {
        clearInterval(timerId);
      }
    },
  });

  return new Response(stream);
}

async function getChatbotSiteName(
  client: SupabaseClient<Database>,
  chatbotId: string,
) {
  const response = await client
    .from(CHATBOTS_TABLE)
    .select(
      `
    site_name
  `,
    )
    .eq('id', chatbotId)
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data.site_name;
}