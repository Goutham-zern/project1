import { PageBody } from '~/core/ui/Page';
import Heading from '~/core/ui/Heading';
import DesignChatbotContainer from './components/DesignChatbotContainer';
import { getChatbot } from '~/lib/chatbots/queries';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';

interface ChatbotDesignPageParams {
  params: {
    organization: string;
    chatbot: string;
  };
}

async function ChatbotDesignPage({ params }: ChatbotDesignPageParams) {
  const client = getSupabaseServerComponentClient();
  const chatbot = await getChatbot(client, +params.chatbot);
  const settings = chatbot.settings as unknown as ChatbotSettings;

  return (
    <PageBody className={'py-container space-y-4'}>
      <Heading type={4}>
        Design
      </Heading>

      <DesignChatbotContainer settings={settings} chatbotId={params.chatbot} />
    </PageBody>
  );
}

export default ChatbotDesignPage;