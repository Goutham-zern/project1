import { PlusCircleIcon } from '@heroicons/react/24/outline';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';

import { PageBody } from '~/core/ui/Page';
import { getJobs } from '~/lib/jobs/queries';
import JobsTable from './components/JobsTable';
import CrawlWebsiteModal from '../components/CrawlWebsiteModal';
import { getChatbot } from '~/lib/chatbots/queries';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';
import { withI18n } from '~/i18n/with-i18n';
import Trans from '~/core/ui/Trans';

interface ChatbotTrainingPageParams {
  params: {
    organization: string;
    chatbot: string;
  };

  searchParams: {
    page?: string;
  };
}

export const metadata = {
  title: 'Training',
};

async function ChatbotTrainingPage({
  params,
  searchParams,
}: ChatbotTrainingPageParams) {
  const page = searchParams.page ? +searchParams.page : 1;

  const [data, chatbot] = await Promise.all([
    loadData(params.chatbot, { page }),
    getChatbot(getSupabaseServerComponentClient(), params.chatbot),
  ]);

  const isEmpty = data.count === 0;

  if (isEmpty) {
    return <EmptyState chatbotId={chatbot.id} url={chatbot.url} />;
  }

  return (
    <PageBody className={'py-container space-y-4'}>
      <div className={'flex space-x-4 justify-between items-end'}>
        <div className={'flex flex-col space-y-2'}>
          <Heading type={4}>
            <Trans i18nKey={'chatbot:trainingTab'} />
          </Heading>

          <p className={'text-sm text-gray-500 dark:text-gray-400'}>
            <Trans i18nKey={'chatbot:trainingTabSubheading'} />
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

export default withI18n(ChatbotTrainingPage);

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

  const { data: jobs, count } = await getJobs(client, chatbot, {
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

function TrainingButton(props: { chatbotId: string; url: string }) {
  return (
    <div className={'flex'}>
      <CrawlWebsiteModal {...props}>
        <Button size={'sm'} variant={'outline'}>
          <PlusCircleIcon className={'h-4 w-4 mr-2'} />

          <span>
            <Trans i18nKey={'chatbot:trainChatbotButton'} />
          </span>
        </Button>
      </CrawlWebsiteModal>
    </div>
  );
}

function EmptyState(props: { chatbotId: string; url: string }) {
  return (
    <>
      <div
        className={'flex flex-col space-y-8 items-center justify-center flex-1'}
      >
        <div className={'flex flex-col space-y-2 items-center justify-center'}>
          <Heading type={3}>
            <Trans i18nKey={'chatbot:noJobsFound'} />
          </Heading>

          <div>
            <Trans i18nKey={'chatbot:noJobsFoundDescription'} />
          </div>
        </div>

        <div>
          <CrawlWebsiteModal {...props}>
            <Button>
              <Trans i18nKey={'chatbot:importDocumentsButton'} />
            </Button>
          </CrawlWebsiteModal>
        </div>
      </div>
    </>
  );
}
