import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import Modal from '~/core/ui/Modal';
import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';
import Textarea from '~/core/ui/Textarea';

import getSupabaseServerActionClient from '~/core/supabase/action-client';
import Button from '~/core/ui/Button';
import { updateChatbot } from '~/lib/chatbots/mutations';

function EditChatbotModal(
  props: React.PropsWithChildren<{
    chatbot: {
      name: string;
      siteName: string;
      description?: string | null;
      id: string;
      url: string;
    };
  }>,
) {
  return (
    <Modal heading={'Edit Chatbot'} Trigger={props.children}>
      <form action={updateChatbotAction}>
        <div className={'flex flex-col space-y-4'}>
          <input type='hidden' name={'id'} value={props.chatbot.id.toString()} />

          <TextFieldLabel>
            Name
            <TextFieldInput name={'name'} defaultValue={props.chatbot.name} required />
          </TextFieldLabel>

          <TextFieldLabel>
            Website URL
            <TextFieldInput name={'url'} defaultValue={props.chatbot.url} required type={'url'} />
          </TextFieldLabel>

          <TextFieldLabel>
            Chatbot Website Name
            <TextFieldInput name={'site_name'} defaultValue={props.chatbot.siteName} required />
          </TextFieldLabel>

          <TextFieldLabel>
            Description
            <Textarea name={'description'} defaultValue={props.chatbot.description ?? ''} />
          </TextFieldLabel>

          <Button>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditChatbotModal;

async function updateChatbotAction(data: FormData) {
  'use server';
  
  const params = z
    .object({
      name: z.string(),
      description: z.string().nullish().default(''),
      url: z.string().url(),
      site_name: z.string().min(1),
      id: z.coerce.number(),
    })
    .parse(Object.fromEntries(data.entries()));
  
  const client = getSupabaseServerActionClient();
  
  const {
    error,
  } = await updateChatbot(client, params);

  revalidatePath(`/dashboard/[organization]/chatbots/[chatbot]`, 'layout');

  return {
    success: !error,
  };
}