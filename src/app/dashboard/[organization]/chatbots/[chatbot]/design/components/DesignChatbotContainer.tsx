'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useForm } from 'react-hook-form';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';

import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';
import Button from '~/core/ui/Button';

import { Popover, PopoverContent, PopoverTrigger } from '~/core/ui/Popover';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/core/ui/Select';

import Label from '~/core/ui/Label';
import chatbotMessagesStore from '~/components/chatbot/lib/chatbot-messages-store';
import { saveChatbotSettingsAction } from '../../actions.server';

const ChatBot = dynamic(() => import('~/components/chatbot/ChatBot'), {
  ssr: false,
});

const LOCAL_STORAGE_KEY = 'design-chatbot-messages';

const positions: Array<'bottom-right' | 'bottom-left'> = [
  'bottom-right',
  'bottom-left',
];

function DesignChatbotContainer(
  props: React.PropsWithChildren<{
    chatbotId: string;
    settings: ChatbotSettings;
  }>,
) {
  const form = useForm({
    defaultValues: {
      title: props.settings.title || 'Acme AI Assistant',
      textColor: props.settings.branding.textColor || '#fff',
      primaryColor: props.settings.branding.primaryColor || '#0a0a0a',
      accentColor: props.settings.branding.accentColor || '#0a0a0a',
      position: props.settings.position || positions[0],
    },
    mode: 'onChange',
  });

  const title = form.watch('title');
  const textColor = form.watch('textColor');
  const primaryColor = form.watch('primaryColor');
  const accentColor = form.watch('accentColor');
  const position = form.watch('position');

  const settings = {
    title,
    position,
    branding: {
      textColor,
      primaryColor,
      accentColor,
    },
  };

  useLoadStaticMessages();

  const [formState, formAction] = useFormState(
    saveChatbotSettingsAction,
    undefined,
  );

  useEffect(() => {
    if (formState) {
      if (formState.success) {
        toast.success('Chatbot settings saved successfully');
      } else {
        toast.error(
          'Sorry, we encountered an error while saving your settings',
        );
      }
    }
  }, [formState]);

  return (
    <>
      <form action={formAction}>
        <div className={'lg:max-w-md w-full'}>
          <div className={'flex flex-col space-y-4'}>
            <input type="hidden" value={title} name={'title'} />
            <input type="hidden" value={primaryColor} name={'primaryColor'} />
            <input type="hidden" value={textColor} name={'textColor'} />
            <input type="hidden" value={accentColor} name={'accentColor'} />
            <input type="hidden" value={position} name={'position'} />
            <input type="hidden" value={props.chatbotId} name={'chatbotId'} />

            <TextFieldLabel>
              Chatbot Title
              <TextFieldInput
                {...form.register('title', { required: true })}
                required
                name={'title'}
                placeholder={`Ex. Acme AI Assistant`}
              />
            </TextFieldLabel>

            <TextFieldLabel>
              <span>Primary Color</span>
              <ColorPicker
                color={primaryColor}
                setColor={(color) => form.setValue('primaryColor', color)}
              />
            </TextFieldLabel>

            <TextFieldLabel>
              <span>Text Color</span>

              <ColorPicker
                color={textColor}
                setColor={(color) => form.setValue('textColor', color)}
              />
            </TextFieldLabel>

            <Label>
              <span>Position</span>

              <Select
                value={position}
                onValueChange={(value) =>
                  form.setValue('position', value as (typeof positions)[0])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={'Position'} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={positions[0]}>Bottom Right</SelectItem>
                  <SelectItem value={positions[1]}>Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </Label>

            <SubmitButton />
          </div>
        </div>
      </form>

      <ChatBot
        isOpen
        isDisabled
        settings={settings}
        chatbotId={+props.chatbotId}
        storageKey={LOCAL_STORAGE_KEY}
      />
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} type={'submit'}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export default DesignChatbotContainer;

function ColorPicker(
  props: React.PropsWithChildren<{
    color: string;
    setColor: (color: string) => void;
  }>,
) {
  const [color, setColor] = useState(props.color);

  useEffect(() => {
    setColor(props.color);
  }, [props.color]);

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <div className={'flex space-x-2 items-center'}>
            <div
              onClick={(e) => e.stopPropagation()}
              className={'w-10 h-[40px] rounded-lg border cursor-pointer'}
              style={{
                backgroundColor: color,
              }}
            />

            <TextFieldInput readOnly value={color} />
          </div>
        </PopoverTrigger>

        <PopoverContent>
          <HexColorPicker
            color={color}
            onChange={(color) => {
              setColor(color);
              props.setColor(color);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function useLoadStaticMessages() {
  useEffect(() => {
    chatbotMessagesStore.saveMessages([
      {
        content: 'Hello, how can I help you?',
        role: 'assistant',
        id: '1',
      },
      {
        content: `I'd like to know more about your product`,
        role: 'user',
        id: '2',
      },
      {
        id: '3',
        role: 'assistant',
        content: `Sure, I'll be happy to help you with that. May I know your name?`,
      },
      {
        id: '4',
        role: 'user',
        content: `John Doe`,
      },
    ], LOCAL_STORAGE_KEY);
  }, []);
}
