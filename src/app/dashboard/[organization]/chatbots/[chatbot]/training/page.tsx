import { PageBody } from '~/core/ui/Page';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';
import { getJobs } from '~/lib/jobs/queries';
import JobsTable from './components/JobsTable';
import CrawlWebsiteModal from '../components/CrawlWebsiteModal';
import { getChatbot } from '~/lib/chatbots/queries';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';

interface ChatbotTrainingPageParams {
  params: {
    organization: string;
    chatbot: string;
  };

  searchParams: {
    page?: string;
  };
}

async function ChatbotTrainingPage({
  params,
  searchParams,
}: ChatbotTrainingPageParams) {
  const page = searchParams.page ? +searchParams.page : 1;

  const [data, chatbot] = await Promise.all([
    loadData(params.chatbot, { page }),
    getChatbot(getSupabaseServerComponentClient(), +params.chatbot),
  ])

  const isEmpty = data.count === 0;

  if (isEmpty) {
    return <EmptyState chatbotId={chatbot.id} url={chatbot.url} />
  }

  return (
    <PageBody className={'py-container space-y-4'}>
      <Heading type={4}>
        Training
      </Heading>

      <TrainingButton chatbotId={chatbot.id} url={chatbot.url} />

      <JobsTable {...data} />
    </PageBody>
  );
}

export default ChatbotTrainingPage;

async function loadData(
  chatbot: string,
  params: {
    page?: number;
  },
) {
  const client = getSupabaseServerComponentClient();
  const perPage = 25;
  const page = params.page || 1;
  const startOffset = (page - 1) * perPage;
  const endOffset = page * perPage;

  const { data: jobs, count } = await getJobs(client, +chatbot, {
    from: startOffset,
    to: endOffset,
  });

  return {
    jobs,
    count,
    page,
    perPage,
  };
}

function TrainingButton(props: { chatbotId: number; url: string }) {
  return (
    <div className={'flex mb-4'}>
      <CrawlWebsiteModal {...props}>
        <Button size={'sm'} variant={'outline'}>
          Train Chatbot with new documents
        </Button>
      </CrawlWebsiteModal>
    </div>
  );
}

function EmptyState(props: { chatbotId: number; url: string }) {
  return (
    <>
      <div className={'flex flex-col space-y-8 items-center justify-center flex-1'}>
        <div className={'flex flex-col space-y-2 items-center justify-center'}>
          <Heading type={3}>
            No previous imports found
          </Heading>

          <div>
            You have not imported any documents yet.
          </div>
        </div>

        <div>
          <CrawlWebsiteModal {...props}>
            <Button>Import documents from a website</Button>
          </CrawlWebsiteModal>
        </div>
      </div>
    </>
  );
}
