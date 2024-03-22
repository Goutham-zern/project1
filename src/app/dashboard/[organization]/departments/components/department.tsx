import React, { useState } from 'react';
import Tile from '~/core/ui/Tile';
import Button from '~/core/ui/Button';

import UpdateDepartmentModal from './UpdateDepartmentModel';
import DeleteDepartmentModal from './DeleteDepartmentModel';
import { deleteDepartment } from '../crud'; // Import CRUD function for deleting a department
import { PencilIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';


function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options);
  }

export interface DepartmentComponentProps {
  name: string;
  imageUrl: string;
  dateCreated: string;
  id: number;
  setEffect: (value: number) => void;
}

const DepartmentComponent: React.FC<DepartmentComponentProps> = ({
  name,
  imageUrl,
  dateCreated,
  id,
  setEffect,
}) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [nameCurrent, setName] = useState(name);
  const [imageUrlCurrent, setImageUrl] = useState(imageUrl);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const onUpdateDepartment = (departmentData: {
    name: string;
    image_url: string;
  }) => {
    setName(departmentData.name);
    setImageUrl(departmentData.image_url);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id);
      setEffect(Math.random() * 100); // Refresh the department list
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  return (
    <Tile>
      <div className="flex justify-between">
        <Tile.Heading>{nameCurrent}</Tile.Heading>
        <div className="flex justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsUpdateOpen(true)}
          >
            <PencilSquareIcon className="w-4 mr-2" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDeleteOpen(true)}
          >
            <TrashIcon className="w-4 mr-2" />
          </Button>
        </div>
      </div>

      <Tile.Body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Display department details */}
          <img src={imageUrlCurrent} alt={nameCurrent} className="rounded w-36 h-36 mb-5" />
          <Tile.Badge trend='up'>{formatDate(dateCreated)}</Tile.Badge>
        </div>


      </Tile.Body>

      {/* Update department modal */}
      <UpdateDepartmentModal
        isOpen={isUpdateOpen}
        setIsOpen={setIsUpdateOpen}
        departmentData={{
            id: id,
          name: nameCurrent,
          image_url: imageUrlCurrent,
          created_at: dateCreated,
        }}
        onUpdateDepartment={onUpdateDepartment}
      />

      {/* Delete department modal */}
      <DeleteDepartmentModal
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        departmentId={id}
        onDelete={handleDelete}
      />
    </Tile>
  );
};

export default DepartmentComponent;
