import { PageBody } from '~/core/ui/Page';
import Heading from '~/core/ui/Heading';
import CopyToClipboardButton from './components/CopyToClipboardButton';

interface ChatbotPublishPageParams {
  params: {
    organization: string;
    chatbot: string;
  };
}

async function ChatbotPublishPage({ params }: ChatbotPublishPageParams) {
  const widgetHostingUrl = process.env.NEXT_PUBLIC_WIDGET_HOSTING_URL;

  const script = `
    <script data-chatbot='${params.chatbot}' src='${widgetHostingUrl}' />
  `.trim();

  return (
    <PageBody className={'py-container space-y-4'}>
      <div className={'flex flex-col space-y-2'}>
        <Heading type={4}>Publish</Heading>

        <div>
          <p className={'text-sm text-gray-500 dark:text-gray-400'}>
            Copy and paste the following code snippet into your website to embed
            your chatbot.
          </p>
        </div>
      </div>

      <pre className={'border text-sm text-gray-600 dark:text-gray-400 rounded-lg p-container'}>
        <code>{script}</code>
      </pre>

      <div>
        <CopyToClipboardButton text={script} />
      </div>
    </PageBody>
  );
}

export default ChatbotPublishPage;
