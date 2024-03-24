'use client'
import React from 'react';
import Button from '~/core/ui/Button';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import CreateDepartmentDialog from './CreateDepartmentDialog';

const CreateDepartmentButton = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleOpenDialog = () => {
        setIsOpen(true);
    };

    return (
        <>
            <Button size="sm" variant="outline" onClick={handleOpenDialog}>
                <PlusCircleIcon className="w-4 mr-2" />
                <span>Add Department</span>
            </Button>
            <CreateDepartmentDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default CreateDepartmentButton;
