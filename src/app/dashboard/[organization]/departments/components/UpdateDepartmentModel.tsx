import { useState } from 'react';
import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import TextField from '~/core/ui/TextField';
import Textarea from '~/core/ui/Textarea';
import { updateDepartment, uploadImageToSupabase } from '../crud';
import { toast } from 'sonner';

const UpdateDepartmentModal: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  departmentData: {
    id: number;
    name: string;
    image_url: string;
    created_at: string;
  };
  onUpdateDepartment: (departmentData: {
    name: string;
    image_url: string;
  }) => void;
}> = ({ isOpen, setIsOpen, departmentData, onUpdateDepartment }) => {
  const [error, setError] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: departmentData.name,
    imageFile: null,
  });
  const backendUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      // Upload image to Supabase storage
      const imageUrl: any = await uploadImageToSupabase(formData.name, formData.imageFile); 
      console.log('Uploaded image to')
      console.log(imageUrl)
      const updatedData = {
        name: formData.name,
        image_url: backendUrl + '/storage/v1/object/public/' + imageUrl?.fullPath, 
      };
  
      const status = await updateDepartment(departmentData.id, updatedData);
    //   if (status === 200) {
        toast.success('Department successfully updated.');
        onUpdateDepartment(updatedData);
    //   } else {
    //     toast.error('Error updating department.');
    //   }
      setIsOpen(false);
    } catch (error) {
      setError(true);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, files } = event.target;
    if (name === 'imageFile') {
      setFormData({
        ...formData,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <Modal heading={'Update Department'} isOpen={isOpen} setIsOpen={setIsOpen}>
      <form onSubmit={handleSubmit}>
        <div className={'flex flex-col space-y-6'}>
          {error && (
            <div className="text-red-500">Error updating department...</div>
          )}
          <TextField>
            <TextField.Label>Name</TextField.Label>
            <TextField.Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </TextField>
          <div>
            <TextField.Label>Image</TextField.Label>
            <input
              type="file"
              name="imageFile"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
          <div className={'flex justify-end'}>
            <Button
              variant={'ghost'}
              type={'button'}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button variant={'ghost'} type={'submit'}>
              Update
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateDepartmentModal;
