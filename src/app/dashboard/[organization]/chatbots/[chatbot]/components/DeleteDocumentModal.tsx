import { useTransition } from 'react';
import { toast } from 'sonner';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import { deleteDocumentAction } from '~/app/dashboard/[organization]/chatbots/[chatbot]/actions.server';

function DeleteDocumentModal({
  documentId,
  onBeforeDelete,
  children,
}: React.PropsWithChildren<{
  documentId: string;
  onBeforeDelete?: () => void;
}>) {
  const [pending, startTransition] = useTransition();

  const deleteAction = (data: FormData) => {
    startTransition(async () => {
      if (onBeforeDelete) {
        onBeforeDelete();
      }

      const promise = deleteDocumentAction(data);

      toast.promise(promise, {
        success: 'Document deleted successfully.',
        error: 'An error occurred while deleting the document.',
        loading: 'Deleting document...',
      });
    });
  }

  return (
    <Modal Trigger={children} heading={`Delete Document`}>
      <div className={'flex flex-col space-y-6'}>
        <div>Are you sure you want to delete this document?</div>

        <form>
          <input type="hidden" name={'documentId'} value={documentId} />

          <div className={'flex justify-end'}>
            <Button
              loading={pending}
              formAction={deleteAction}
              variant={'destructive'}
            >
              Yes, Delete
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default DeleteDocumentModal;
