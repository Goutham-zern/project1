'use client';

import { toast } from 'sonner';
import Button from '~/core/ui/Button';
import { ClipboardIcon } from '@heroicons/react/24/outline';

function CopyToClipboardButton(props: React.PropsWithChildren<{
  text: string;
}>) {
  const onCopy = async () => {
    await navigator.clipboard.writeText(props.text);

    toast.success('Copied to clipboard');
  };

  return (
    <Button variant={'outline'} onClick={onCopy}>
      <ClipboardIcon className={'w-4 mr-2'} />

      <span>
        Copy to Clipboard
      </span>
    </Button>
  )
}

export default CopyToClipboardButton;