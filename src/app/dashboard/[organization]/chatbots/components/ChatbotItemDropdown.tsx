'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/core/ui/Dropdown';

import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteChatbotModal from './DeleteChatbotModal';

function ChatbotItemDropdown(
  props: React.PropsWithChildren<{ chatbotId: string }>,
) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(event) => event.stopPropagation()}
        className={'absolute top-4 right-4'}
      >
        <EllipsisVerticalIcon className={'w-6'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DeleteChatbotModal chatbotId={props.chatbotId}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Delete Chatbot
          </DropdownMenuItem>
        </DeleteChatbotModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ChatbotItemDropdown;
