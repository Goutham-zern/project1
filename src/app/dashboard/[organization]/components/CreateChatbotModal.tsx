import { redirect } from 'next/navigation';
import { z } from 'zod';

import Modal from '~/core/ui/Modal';
import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';

import getSupabaseServerActionClient from '~/core/supabase/action-client';
import getSdk from '~/lib/sdk';

import Textarea from '~/core/ui/Textarea';
import ErrorBoundary from '~/core/ui/ErrorBoundary';
import { Alert, AlertHeading } from '~/core/ui/Alert';
import If from '~/core/ui/If';
import Button from '~/core/ui/Button';
import { insertChatbot } from '~/lib/chatbots/mutations';

function CreateChatbotModal(
  props: React.PropsWithChildren<{
    canCreateChatbot: boolean;
  }>,
) {
  return (
    <Modal Trigger={props.children} heading={`Create Chatbot`}>
      <If
        condition={props.canCreateChatbot}
        fallback={<CannotCreateChatbotAlert />}
      >
        <ErrorBoundary fallback={<ChatbotErrorAlert />}>
          <CreateChatbotForm />
        </ErrorBoundary>
      </If>
    </Modal>
  );
}

export default CreateChatbotModal;

function CreateChatbotForm() {
  return (
    <form action={createChatbotAction}>
      <div className={'flex flex-col space-y-4'}>
        <div>
          <p className={'text-sm text-gray-500'}>
            Get started by creating a new Chatbot for your website.
          </p>
        </div>

        <TextFieldLabel>
          Chatbot Name
          <TextFieldInput
            name={'name'}
            required
            placeholder={'Ex. Home Page Chatbot'}
          />
        </TextFieldLabel>

        <TextFieldLabel>
          Website URL
          <TextFieldInput name={'url'} placeholder={'https://...'} type={'url'} defaultValue={'https://'} />
        </TextFieldLabel>

        <TextFieldLabel>
          Description (optional)
          <Textarea name={'description'} placeholder={'Description...'} />
        </TextFieldLabel>

        <Button>
          Create Chatbot
        </Button>
      </div>
    </form>
  );
}

function ChatbotErrorAlert() {
  return (
    <Alert type={'error'}>
      <AlertHeading>Failed to create chatbot</AlertHeading>
      Sorry, we were unable to create your chatbot. Please try again later.
    </Alert>
  );
}

function CannotCreateChatbotAlert() {
  return (
    <Alert type={'warn'}>
      <AlertHeading>Cannot create Chatbot</AlertHeading>
      You need to update your subscription to create more chatbots.
    </Alert>
  );
}

async function createChatbotAction(data: FormData) {
  'use server';

  const name = z.string().min(2).parse(data.get('name'));
  const description = z.string().optional().parse(data.get('description'));
  const url = z.string().parse(data.get('url'));

  const client = getSupabaseServerActionClient();
  const sdk = getSdk(client);

  const organization = await sdk.organization.getCurrent();

  if (!organization) {
    throw new Error('Organization not found');
  }

  const { data: chatbot, error } = await insertChatbot(client, {
    name,
    description,
    url,
    organizationId: organization.id,
  })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/dashboard/${organization.uuid}/chatbots/${chatbot.id}/documents`);
}
