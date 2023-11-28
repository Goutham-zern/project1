import './chatbot.css';

import { hydrateRoot } from 'react-dom/client';
import { lazy, Suspense, useEffect, useState } from 'react';

const Chatbot = lazy(() => import('../../src/components/chatbot/ChatBot'));

const SDK_NAME = process.env.CHATBOT_SDK_NAME;
const SETTINGS_ENDPOINT = process.env.WIDGET_SETTINGS_ENDPOINT;
const WIDGET_CSS_URL = process.env.WIDGET_CSS_URL;

if (document.readyState !== 'loading') {
  void onReady();
} else {
  document.addEventListener('DOMContentLoaded', onReady);
}

async function onReady() {
  try {
    const settings = await fetchChatbotSettings();
    const id = getChatbotId();

    const element = document.createElement('div');
    const shadow = element.attachShadow({ mode: 'open' });
    const shadowRoot = document.createElement('div');

    shadowRoot.id = 'makerkit-chatbot-container';

    const component = <ChatbotRenderer id={id} settings={settings} />;

    shadow.appendChild(shadowRoot);
    injectStyle(shadowRoot);
    hydrateRoot(shadowRoot, component);

    document.body.appendChild(element);
  } catch (error) {
    console.warn(`Could not initialize Chatbot`);
    console.warn(error);
  }
}

function ChatbotRenderer(props: {
  id: number;
  settings: ChatbotSettings;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Chatbot chatbotId={props.id} settings={props.settings} />
    </Suspense>
  );
}

async function fetchChatbotSettings() {
  const chatbotId = getChatbotId();

  if (!SETTINGS_ENDPOINT) {
    throw new Error('Missing WIDGET_SETTINGS_ENDPOINT environment variable');
  }

  if (!chatbotId) {
    throw new Error('Missing data-chatbot-id attribute');
  }

  const url = `${SETTINGS_ENDPOINT}?id=${chatbotId}`;
  const response = await fetch(url);

  return await response.json() as unknown as ChatbotSettings;
}

function getChatbotId() {
  const script = getCurrentScript();

  if (!script) {
    throw new Error('Script not found');
  }

  const chatbotId = script.getAttribute('data-chatbot');

  if (!chatbotId) {
    throw new Error('Missing data-chatbot-id attribute');
  }

  return Number(chatbotId);
}

function getCurrentScript() {
  const currentScript = document.currentScript;

  if (!SDK_NAME) {
    throw new Error('Missing CHATBOT_SDK_NAME environment variable');
  }

  if (
    currentScript &&
    currentScript.getAttribute('src')?.includes(SDK_NAME)
  ) {
    return currentScript as HTMLScriptElement;
  }

  return Array.from(document.scripts).find((item) => {
    return item.src.includes(SDK_NAME);
  }) as HTMLScriptElement | undefined;
}

function injectStyle(shadowRoot: HTMLElement) {
  const link = document.createElement('link');
  const href = WIDGET_CSS_URL;

  if (!href) {
    throw new Error('Missing WIDGET_CSS_URL environment variable');
  }

  link.rel = 'stylesheet';
  link.href = href;

  shadowRoot.appendChild(link);
}