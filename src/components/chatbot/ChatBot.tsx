'use client';

import ChatBotContainer from './ChatBotContainer';
import ChatBotContextProvider from '~/components/chatbot/ChatbotContext';
import { ChatbotSettings } from '~/components/chatbot/lib/types';

interface ChatBotProps {
  chatbotId: number;

  defaultPrompts?: string[];
  isOpen?: boolean;
  isDisabled?: boolean;
  settings?: ChatbotSettings;
  storageKey?: string;
}

function ChatBot(props: ChatBotProps) {
  const {
    defaultPrompts = [],
    isOpen = false,
    isDisabled = false,
    settings,
    chatbotId,
    storageKey
  } = props;

  return (
    <ChatBotContextProvider state={{ isOpen, isDisabled, settings }}>
      <ChatBotContainer chatbotId={chatbotId} defaultPrompts={defaultPrompts} storageKey={storageKey} />
    </ChatBotContextProvider>
  );
}

export default ChatBot;
