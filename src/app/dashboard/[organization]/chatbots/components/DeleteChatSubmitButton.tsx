'use client';

import { useFormStatus } from 'react-dom';
import Button from '~/core/ui/Button';

function DeleteChatSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} variant={'destructive'}>
      Yes, delete this chatbot
    </Button>
  );
}

export default DeleteChatSubmitButton;
