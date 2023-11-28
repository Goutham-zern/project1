import { PlusCircleIcon } from '@heroicons/react/24/outline';

import AppHeader from './components/AppHeader';
import { withI18n } from '~/i18n/with-i18n';
import Trans from '~/core/ui/Trans';
import Button from '~/core/ui/Button';
import { PageBody } from '~/core/ui/Page';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';
import Heading from '~/core/ui/Heading';
import SubHeading from '~/core/ui/SubHeading';
import loadAppData from '~/lib/server/loaders/load-app-data';
import Alert from '~/core/ui/Alert';
import CardButton from '~/core/ui/CardButton';
import { getChatbots } from '~/lib/chatbots/queries';
import CreateChatbotModal from './components/CreateChatbotModal';

export const metadata = {
  title: 'Chatbots',
};

interface ChatbotsPageProps {
  params: {
    organization: string;
  };
}

async function ChatbotsPage({ params }: ChatbotsPageProps) {
  const [chatbots, canCreateChatbot] = await loadChatbots(params.organization);

  return (
    <>
      <AppHeader
        title={<Trans i18nKey={'common:chatbotsTabLabel'} />}
        description={<Trans i18nKey={'common:chatbotsTabDescription'} />}
      >
        <CreateChatbotModal canCreateChatbot={canCreateChatbot}>
          <Button size={'sm'} variant={'outline'}>
            <PlusCircleIcon className={'w-4 mr-2'} />

            <span>Add Chatbot</span>
          </Button>
        </CreateChatbotModal>
      </AppHeader>

      <PageBody>
        <ChatbotsList organization={params.organization} data={chatbots}  />
      </PageBody>
    </>
  );
}

export default withI18n(ChatbotsPage);

function EmptyState() {
  return (
    <div className={'flex flex-col items-center justify-center h-full w-full'}>
      <div
        className={
          'lg:p-24 flex flex-col justify-center items-center space-y-8'
        }
      >
        <div className={'flex flex-col space-y-2'}>
          <Heading>Let&apos;s create your first Chatbot</Heading>

          <SubHeading>
            Start offloading your customer support to AI
          </SubHeading>
        </div>

        <CreateChatbotModal canCreateChatbot={true}>
          <Button block size={'lg'}>
            <PlusCircleIcon className={'h-6 mr-4'} />
            <span>Create your first Chatbot</span>
          </Button>
        </CreateChatbotModal>
      </div>
    </div>
  );
}

function ChatbotsList(
  props: React.PropsWithChildren<{
    data: Awaited<ReturnType<typeof getChatbots>>;
    organization: string;
  }>,
) {
  const { error, data } = props.data;

  if (error) {
    return (
      <Alert type={'error'}>
        Sorry, we encountered an error while fetching your boards
      </Alert>
    );
  }

  if (!data.length) {
    return <EmptyState />;
  }

  return (
    <div className={'grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-8'}>
      {data.map((item) => {
        return (
          <CardButton
            className={'px-8'}
            href={`${props.organization}/chatbots/` + item.id.toString()}
            key={item.id}
          >
            <p>{item.name}</p>
          </CardButton>
        );
      })}
    </div>
  );
}

async function loadChatbots(uid: string) {
  const client = getSupabaseServerComponentClient();
  const appData = await loadAppData(uid);
  const organization = appData.organization?.id;

  if (!organization) {
    throw new Error(`No organization found`);
  }

  //TODO: check if user can create chatbot
  const canCreateChatbot = true;
  const chatbots = getChatbots(client, organization);

  return Promise.all([chatbots, canCreateChatbot]);
}
