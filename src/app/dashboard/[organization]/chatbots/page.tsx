import { PlusCircleIcon } from '@heroicons/react/24/outline';

import AppHeader from '../components/AppHeader';
import { withI18n } from '~/i18n/with-i18n';
import Trans from '~/core/ui/Trans';
import Button from '~/core/ui/Button';
import { PageBody } from '~/core/ui/Page';
import Heading from '~/core/ui/Heading';
import SubHeading from '~/core/ui/SubHeading';
import loadAppData from '~/lib/server/loaders/load-app-data';
import Alert from '~/core/ui/Alert';
import CardButton from '~/core/ui/CardButton';
import { getChatbots } from '~/lib/chatbots/queries';

import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';

import CreateChatbotModal from '../components/CreateChatbotModal';
import ChatbotItemDropdown from './components/ChatbotItemDropdown';

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
        <ChatbotsList data={chatbots} />
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

          <SubHeading>Start offloading your customer support to AI</SubHeading>
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
        const href = `chatbots/` + item.id;

        return (
          <div key={item.id} className={'relative'}>
            <CardButton className={'px-8 w-full'} href={href}>
              <p>{item.name}</p>
            </CardButton>

            <ChatbotItemDropdown chatbotId={item.id} />
          </div>
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

  const canCreateChatbot = client
    .rpc('can_create_chatbot', {
      org_id: organization,
    })
    .then((response) => {
      return response.data ?? false;
    });

  const chatbots = getChatbots(client, organization);

  return Promise.all([chatbots, canCreateChatbot]);
}
