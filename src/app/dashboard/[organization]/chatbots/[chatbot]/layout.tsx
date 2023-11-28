import { PencilSquareIcon } from '@heroicons/react/24/outline';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';

import NavigationMenu from '~/core/ui/Navigation/NavigationMenu';
import NavigationMenuItem from '~/core/ui/Navigation/NavigationItem';
import { getChatbot } from '~/lib/chatbots/queries';
import { PageHeader } from '~/core/ui/Page';
import configuration from '~/configuration';
import Button from '~/core/ui/Button';
import EditChatbotModal from '../components/EditChatbotModal';

async function ChatbotLayout(
  props: React.PropsWithChildren<{
    params: {
      organization: string;
      chatbot: string;
    };
  }>,
) {
  const client = getSupabaseServerComponentClient();
  const chatbot = await getChatbot(client, +props.params.chatbot);

  const path = (path: string = '') => {
    const { organization, chatbot } = props.params;

    return [
      configuration.paths.appHome,
      organization,
      'chatbots',
      chatbot,
      path,
    ]
      .filter(Boolean)
      .join('/');
  };

  return (
    <div className={'flex flex-col h-full'}>
      <PageHeader title={chatbot.name} description={chatbot.description}>
        <EditChatbotModal chatbot={chatbot}>
          <Button size={'sm'} variant={'outline'}>
            <PencilSquareIcon className={'h-4 mr-2'} />
            <span>Edit</span>
          </Button>
        </EditChatbotModal>
      </PageHeader>

      <div className={'px-container'}>
        <NavigationMenu bordered>
          <NavigationMenuItem
            link={{
              path: path('documents'),
              label: 'Documents',
            }}
          />

          <NavigationMenuItem
            link={{
              path: path('training'),
              label: 'Training',
            }}
          />

          <NavigationMenuItem
            link={{
              path: path('design'),
              label: 'Design',
            }}
          />

          <NavigationMenuItem
            link={{
              path: path('playground'),
              label: 'Playground',
            }}
          />

          <NavigationMenuItem
            link={{
              path: path('publish'),
              label: 'Publish',
            }}
          />
        </NavigationMenu>
      </div>

      {props.children}
    </div>
  );
}

export default ChatbotLayout;
