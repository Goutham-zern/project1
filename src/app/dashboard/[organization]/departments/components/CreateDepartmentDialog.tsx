import React from 'react';

import Modal from '~/core/ui/Modal';
import CreateDepartmentForm from './CreateDepartmentForm';

interface CreateDepartmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
}



export default function CreateDepartmentDialog({ isOpen, onClose }: CreateDepartmentDialogProps) {
  return (
    <Modal isOpen={isOpen} setIsOpen={onClose} heading="Create Department" closeButton>
      <div className="p-4">
        <CreateDepartmentForm onSuccess={onClose} /> 
      </div>
    </Modal>
  );
}

