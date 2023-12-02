import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import { deleteChatbotAction } from '~/app/dashboard/[organization]/chatbots/actions.server';
import DeleteChatSubmitButton from '~/app/dashboard/[organization]/chatbots/components/DeleteChatSubmitButton';

function DeleteChatbotModal(
  props: React.PropsWithChildren<{
    chatbotId: string
  }>,
) {
  return (
    <Modal heading={'Edit Chatbot'} Trigger={props.children}>
      <form action={deleteChatbotAction}>
        <input type='hidden' name={'chatbotId'} value={props.chatbotId} />

        <div className={'flex flex-col space-y-4 text-sm'}>
          <div className={'flex flex-col space-y-2'}>
            <div>
              You <b>will not</b> be able to recover this chatbot, and all of its data will be lost (including all of its messages).
            </div>

            <div>
              Are you sure you want to delete this chatbot?
            </div>
          </div>

          <DeleteChatSubmitButton />
        </div>
      </form>
    </Modal>
  );
}

export default DeleteChatbotModal;
