import { useContext } from 'react';

import { ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import { ChatBotContext } from '~/components/chatbot/ChatbotContext';

function ChatBotBubble() {
  const { state, onOpenChange } = useContext(ChatBotContext);
  const primaryColor = state.settings.branding.primaryColor;

  return (
    <button
      style={{
        backgroundColor: primaryColor
      }}
      className={
        'animate-out text-white h-16 w-16 rounded-full' +
        ' flex items-center justify-center fixed right-8 bottom-8' +
        ' hover:shadow-xl hover:opacity/90 transition-all' +
        ' hover:-translate-y-1 duration-500 hover:scale-105 z-50'
      }
      onClick={() => onOpenChange(true)}
    >
      <ChatBubbleBottomCenterIcon className="h-8 w-8" />
    </button>
  );
}

export default ChatBotBubble;
