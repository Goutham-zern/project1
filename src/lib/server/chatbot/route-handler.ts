import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import isBot from 'isbot';
import { StreamingTextResponse } from 'ai';
import { z } from 'zod';

import generateReplyFromChain from './langchain';
import configuration from '~/configuration';
import getSupabaseRouteHandlerClient from '~/core/supabase/route-handler-client';
import getVectorStore from '~/lib/server/chatbot/vector-store';

const CHATBOT_TURNSTILE_SECRET_KEY = process.env.CHATBOT_TURNSTILE_SECRET_KEY;

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
export async function handleChatBotRequest(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
    });
  }

  if (isBot(req.headers.get('user-agent'))) {
    return new Response(`No chatbot for you!`, {
      status: 403,
    });
  }

  // we validate the captcha token if the secret key is present
  if (CHATBOT_TURNSTILE_SECRET_KEY) {
    const captchaToken = headers().get('x-captcha-token');

    // we check if the captcha token is present
    if (!captchaToken) {
      return new Response('Missing captcha token', { status: 400 });
    }

    // we validate the captcha token
    await validateCaptchaToken(captchaToken);
  } else {
    // user is not using CAPTCHA - we warn them
    if (!configuration.production) {
      console.warn(
        `It is recommended to set the CHATBOT_TURNSTILE_SECRET_KEY environment variable in production to prevent abuse.`,
      );
    }
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

  const chatbotId = z.coerce.number().parse(req.headers.get('x-chatbot-id'));

  const { messages } = zodSchema.parse(await req.json());

  // if the user is using the fake data streamer, we return a fake response
  if (USE_FAKE_DATA_STREAMER) {
    return fakeDataStreamer();
  }

  const client = getSupabaseRouteHandlerClient({
    admin: true,
  });

  const canGenerateAIResponse = await client.rpc('can_respond_to_message', {
    chatbot_id: chatbotId,
  });

  const filter = {
    chatbot_id: chatbotId
  };

  // if the Organization can't generate an AI response, we use a normal search
  if (!canGenerateAIResponse.data) {
    const latestMessage = messages[messages.length - 1];

    // in this case, use a normal search function
    return searchDocuments({ client, query: latestMessage.content, filter});
  }

  const stream = await generateReplyFromChain( { client, messages, filter });

  return new StreamingTextResponse(stream);
}

export default handleChatBotRequest;

async function validateCaptchaToken(token: string) {
  let formData = new FormData();

  if (!CHATBOT_TURNSTILE_SECRET_KEY) {
    throw new Error('Missing CHATBOT_TURNSTILE_SECRET_KEY');
  }

  formData.append('secret', CHATBOT_TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  const result = await fetch(url, {
    body: formData,
    method: 'POST',
  });

  const outcome = await result.json();

  if (outcome.success) {
    return true;
  }

  throw new Error('Invalid captcha token');
}

async function searchDocuments(params: {
  client: ReturnType<typeof getSupabaseRouteHandlerClient>;
  query: string;
  filter: NumberObject;
}) {
  const store = await getVectorStore(params.client);
  const maxResults = 3;

  const documents = await store.similaritySearch(params.query, maxResults,{
    filter: params.filter,
  });

  const content = documents.map((document) => document.pageContent).join('---');

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(`I found these documents that might help you:\n${content}`);
      controller.close();
    },
  });

  return new StreamingTextResponse(stream);
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
