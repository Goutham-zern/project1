import { PageBody } from '~/core/ui/Page';
import Heading from '~/core/ui/Heading';
import DesignChatbotContainer from './components/DesignChatbotContainer';
import { getChatbot } from '~/lib/chatbots/queries';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';
import { ChatbotSettings } from '~/components/chatbot/lib/types';

interface ChatbotDesignPageParams {
  params: {
    organization: string;
    chatbot: string;
  };
}

async function ChatbotDesignPage({ params }: ChatbotDesignPageParams) {
  const client = getSupabaseServerComponentClient();
  const chatbot = await getChatbot(client, params.chatbot);
  const settings = chatbot.settings as unknown as ChatbotSettings;

  return (
    <PageBody className={'py-container space-y-4'}>
      <div className={'flex flex-col space-y-2'}>
        <Heading type={4}>Design</Heading>

        <p className={'text-sm text-gray-500 dark:text-gray-400'}>
          Make the Chatbot your own by customizing its appearance and behavior.
        </p>
      </div>

      <DesignChatbotContainer
        settings={settings}
        siteName={chatbot.siteName}
        chatbotId={params.chatbot}
      />
    </PageBody>
  );
}

export default ChatbotDesignPage;
