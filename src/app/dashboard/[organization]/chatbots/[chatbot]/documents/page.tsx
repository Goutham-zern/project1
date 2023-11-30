import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/database.types';

import { getChatbot, getChatbotDocuments } from '~/lib/chatbots/queries';
import { PageBody } from '~/core/ui/Page';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';
import If from '~/core/ui/If';

import CrawlWebsiteModal from '../components/CrawlWebsiteModal';
import DocumentsTable from '../components/DocumentsTable';
import notFound from '~/app/not-found';
import DocumentDialog from './DocumentDialog';

interface ChatbotPageParams {
  params: {
    organization: string;
    chatbot: string;
  };

  searchParams: {
    page?: string;
    query?: string;
  };
}

async function loadDocuments(
  client: SupabaseClient<Database>,
  chatbotId: number,
  page: number = 1,
  query: string = '',
) {
  const perPage = 10;
  const from = (page - 1) * perPage;
  const to = page * perPage;

  const data = await getChatbotDocuments(
    client,
    chatbotId,
    {
      from,
      to,
      query,
    },
  );

  return {
    ...data,
    page,
    query,
    perPage,
  };
}

async function ChatbotPage({ params, searchParams }: ChatbotPageParams) {
  const client = getSupabaseServerComponentClient();
  const chatbotId = +params.chatbot;
  const page = searchParams.page ? +searchParams.page : 1;

  const [props, chatbot] = await Promise.all([
    loadDocuments(client, chatbotId, page),
    getChatbot(client, chatbotId),
  ]);

  if (!chatbot) {
    return notFound();
  }

  return (
    <PageBody className={'py-container space-y-4'}>
      <div className={'flex flex-col space-y-2'}>
        <Heading type={4}>
          Documents
        </Heading>

        <p className={'text-sm text-gray-500 dark:text-gray-400'}>
          These are the documents that your chatbot has learned from your website.
        </p>
      </div>

      <If
        condition={props.count}
        fallback={<EmptyState id={chatbot.id} url={chatbot.url} />}
      >
        <DocumentsTable {...props} />
      </If>

      <DocumentDialog />
    </PageBody>
  );
}

export default ChatbotPage;

function EmptyState(props: { id: number; url: string }) {
  return (
    <div
      className={
        'flex flex-col flex-1 items-center justify-center space-y-8 py-16'
      }
    >
      <div className={'flex flex-col space-y-2 items-center'}>
        <Heading type={3}>No documents found</Heading>

        <p>Get started by crawling your website to train your chatbot</p>
      </div>

      <CrawlWebsiteModal chatbotId={props.id} url={props.url}>
        <Button size={'sm'} className={'text-sm text-center'}>
          Train Chatbot with Website
        </Button>
      </CrawlWebsiteModal>
    </div>
  );
}
