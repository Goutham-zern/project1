import dynamic from 'next/dynamic';

import { PageBody } from '~/core/ui/Page';
import Heading from '~/core/ui/Heading';
import { getChatbot } from '~/lib/chatbots/queries';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';

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
  const chatbot = await getChatbot(client, +params.chatbot);
  const settings = chatbot.settings as unknown as ChatbotSettings;

  return (
    <>
      <PageBody className={'py-container space-y-2'}>
        <Heading type={4}>Playground</Heading>

        <p className={'text-sm'}>
          Play around with your chatbot here and see how it responds to
          different inputs.
        </p>
      </PageBody>

      <ChatBot
        isOpen
        chatbotId={chatbot.id}
        settings={settings}
        storageKey={LOCAL_STORAGE_KEY}
      />
    </>
  );
}

export default ChatbotPlaygroundPage;
