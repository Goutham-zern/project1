import { useState } from 'react';
import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';

const DeleteDepartmentModal: React.FC<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  departmentId: number;
  onDelete: (id: number) => void;
}> = ({ isOpen, setIsOpen, departmentId, onDelete }) => {
  const [confirmation, setConfirmation] = useState('');

  const handleConfirm = () => {
    if (confirmation.toUpperCase() === 'DELETE') {
      onDelete(departmentId);
    }
    setIsOpen(false);
  };

  return (
    <Modal heading={'Delete Department'} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col space-y-4">
        <p>
          Are you sure you want to delete this department? This action cannot be
          undone.
        </p>
        <p>
          To confirm deletion, please type <b>DELETE</b> below:
        </p>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="border rounded p-2"
        />
        <div className="flex justify-end space-x-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmation.toUpperCase() !== 'DELETE'}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteDepartmentModal;
