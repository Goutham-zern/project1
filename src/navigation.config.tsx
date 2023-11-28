import { ChatBubbleBottomCenterTextIcon, ChatBubbleLeftIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import configuration from '~/configuration';

const NAVIGATION_CONFIG = (organization: string) => ({
  items: [
    {
      label: 'common:chatbotsTabLabel',
      path: getPath(organization, ''),
      Icon: ({ className }: { className: string }) => {
        return <ChatBubbleLeftIcon className={className} />;
      },
      end: false,
    },
    {
      label: 'common:conversationsTabLabel',
      path: getPath(organization, 'conversations'),
      Icon: ({ className }: { className: string }) => {
        return <ChatBubbleBottomCenterTextIcon className={className} />;
      },
    },
    {
      label: 'common:settingsTabLabel',
      path: getPath(organization, 'settings'),
      Icon: ({ className }: { className: string }) => {
        return <Cog8ToothIcon className={className} />;
      },
    },
  ],
});

export default NAVIGATION_CONFIG;

function getPath(organizationId: string, path: string) {
  const appPrefix = configuration.paths.appPrefix;

  return [appPrefix, organizationId, path].filter(Boolean).join('/');
}
