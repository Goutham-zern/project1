import { PageBody } from '~/core/ui/Page';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';
import { getJobs } from '~/lib/jobs/queries';
import JobsTable from './components/JobsTable';
import CrawlWebsiteModal from '../components/CrawlWebsiteModal';
import { getChatbot } from '~/lib/chatbots/queries';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

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
  ]);

  const isEmpty = data.count === 0;

  if (isEmpty) {
    return <EmptyState chatbotId={chatbot.id} url={chatbot.url} />;
  }

  return (
    <PageBody className={'py-container space-y-4'}>
      <div className={'flex space-x-4 justify-between items-end'}>
        <div className={'flex flex-col space-y-2'}>
          <Heading type={4}>Training</Heading>

          <p className={'text-sm text-gray-500 dark:text-gray-400'}>
            Train your chatbot with new documents or see the status of previous
            training jobs.
          </p>
        </div>

        <div>
          <TrainingButton chatbotId={chatbot.id} url={chatbot.url} />
        </div>
      </div>

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
    <div className={'flex'}>
      <CrawlWebsiteModal {...props}>
        <Button size={'sm'} variant={'outline'}>
          <PlusCircleIcon className={'h-4 w-4 mr-2'} />

          <span>
            Train Chatbot
          </span>
        </Button>
      </CrawlWebsiteModal>
    </div>
  );
}

function EmptyState(props: { chatbotId: number; url: string }) {
  return (
    <>
      <div
        className={'flex flex-col space-y-8 items-center justify-center flex-1'}
      >
        <div className={'flex flex-col space-y-2 items-center justify-center'}>
          <Heading type={3}>No previous imports found</Heading>

          <div>You have not imported any documents yet.</div>
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
