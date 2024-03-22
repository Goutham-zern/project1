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
import useCurrentUserRole from '~/lib/organizations/hooks/use-current-user-role';
import useUserSession from '~/core/hooks/use-user-session';
import { getMembershipByEmail, getUserRoleByMembershipId } from '~/lib/memberships/queries';
import { getOrganizationInvitedMembers, getOrganizationsByUserId } from '~/lib/organizations/database/queries';
import MembershipRole from '~/lib/organizations/types/membership-role';
import { User } from '@supabase/supabase-js';

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
  console.log(canCreateChatbot)


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

async function EmptyState() {
  const client = getSupabaseServerComponentClient();
  const userData = await client.auth.getUser();
  const hasPermissions = await canUserCreateChatbot(userData.data.user)
  
  return (
    <div className={'flex flex-col items-center justify-center h-full w-full'}>
      <div
        className={
          'lg:p-24 flex flex-col justify-center items-center space-y-8'
        }
      >
        <div className={'flex flex-col space-y-2'}>
          <Heading>
            <Trans i18nKey={'chatbot:chatbotsEmptyStateHeading'} />
          </Heading>

          <SubHeading>
            <Trans i18nKey={'chatbot:chatbotsEmptyStateSubheading'} />
          </SubHeading>
        </div>

        <CreateChatbotModal canCreateChatbot={hasPermissions}>
          <Button block size={'lg'}>
            <PlusCircleIcon className={'h-6 mr-4'} />
            <span>
              <Trans i18nKey={'chatbot:chatbotsEmptyStateButton'} />
            </span>
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
        <Trans i18nKey={'chatbot:chatbotsPageAlertError'} />
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
    .then(async (response) => {
      if (response.error) {
        console.error(response.error);

        return false;
      }

      const client = getSupabaseServerComponentClient();
      const userData = await client.auth.getUser();
      const user = userData.data.user;
      if (!await canUserCreateChatbot(user)) {
        return false;
       }


      return response.data;
    });

  const chatbots = getChatbots(client, organization);

  return Promise.all([chatbots, canCreateChatbot]);
}

const canUserCreateChatbot = async (user: User | null) => {
      // chech if user does not have read-only permisson
      const client2 = getSupabaseServerComponentClient();

      if (user !== null) {
        // const membershipId = await
        if ( user.email && user.id) {
          const organizationData = await getOrganizationsByUserId(client2, user.id);
          if ( organizationData.data != null) {
            const role: MembershipRole = organizationData.data[0].role;
            console.log(role);
            if (role === MembershipRole.Readonly) 
            {
              return false;
            }
          }
        } else {
          return false

        }

      }
      return true;
}
