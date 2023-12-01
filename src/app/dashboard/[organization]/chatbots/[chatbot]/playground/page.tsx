import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

import { PageBody } from '~/core/ui/Page';
import Heading from '~/core/ui/Heading';
import { getChatbot } from '~/lib/chatbots/queries';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';
import { ChatbotSettings } from '~/components/chatbot/lib/types';

const ChatBot = dynamic(() => import('~/components/chatbot/ChatBot'), {
  ssr: false,
});

interface ChatbotPlaygroundPageParams {
  params: {
    organization: string;
    chatbot: string;
  };
}

const LOCAL_STORAGE_KEY = 'chatbot-playground';

async function ChatbotPlaygroundPage({ params }: ChatbotPlaygroundPageParams) {
  const client = getSupabaseServerComponentClient();
  const chatbot = await getChatbot(client, params.chatbot);
  const settings = chatbot.settings as unknown as ChatbotSettings;
  let conversationId = getConversationId()?.value;

  if (!conversationId) {
    conversationId = `playground-${nanoid(16)}`
  }

  return (
    <>
      <PageBody className={'py-container space-y-2'}>
        <Heading type={4}>Playground</Heading>

        <p className={'text-sm text-gray-500 dark:text-gray-400'}>
          Play around with your chatbot here and see how it responds to
          different inputs.
        </p>
      </PageBody>

      <ChatBot
        isOpen
        conversationId={conversationId}
        chatbotId={chatbot.id}
        siteName={chatbot.siteName}
        settings={settings}
        storageKey={LOCAL_STORAGE_KEY}
      />
    </>
  );
}

export default ChatbotPlaygroundPage;

function getConversationId() {
  return cookies().get('playground-conversation-id');
}