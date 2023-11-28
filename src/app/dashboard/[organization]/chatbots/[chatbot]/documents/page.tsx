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
  const perPage = 50;
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

async function ChatbotPage({ params }: ChatbotPageParams) {
  const client = getSupabaseServerComponentClient();
  const chatbotId = +params.chatbot;

  const [props, chatbot] = await Promise.all([
    loadDocuments(client, chatbotId),
    getChatbot(client, chatbotId),
  ]);

  if (!chatbot) {
    return notFound();
  }

  return (
    <PageBody className={'py-container space-y-4'}>
      <Heading type={4}>
        Documents
      </Heading>

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
