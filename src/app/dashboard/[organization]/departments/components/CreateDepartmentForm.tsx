'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';


import { createDepartment, uploadImageToSupabase } from '../crud';
import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';
import Trans from '~/core/ui/Trans';
import Button from '~/core/ui/Button';
import { toast } from 'sonner';


export default function CreateDepartmentForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = z.string().min(2).parse(formData.get('name'));
    const imageFile = formData.get('imageFile') as File;


    // Upload image to Supabase storage
    const imageUrl: any = await uploadImageToSupabase(name, imageFile);
    const image_url = backendUrl + '/storage/v1/object/public/' + imageUrl?.fullPath;
    console.log('Uploaded image to', image_url);

    // Create department in the database
    const status = await createDepartment({
      name,
      image_url,
    });

    console.log(status);

    if (status === 201) {
        toast.success('Department created successfully')
        onSuccess()
    } else {
      throw new Error('Failed to create department');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className={'flex flex-col space-y-4'}>
          <div>
            <p className={'text-sm text-gray-500'}>
              <Trans i18nKey={'department:createDepartmentModalSubheading'} />
            </p>
          </div>
  
          <TextFieldLabel>
            <Trans i18nKey={'department:departmentNameFieldLabel'} />
            <TextFieldInput
              name={'name'}
              required
              placeholder={'Ex. Sales Department'}
            />
          </TextFieldLabel>
  
          <TextFieldLabel>
            <Trans i18nKey={'department:departmentLogoUploadButtonLabel'} />
            {/* <ImageUploadInput name={'imageFile'} /> */}
            <input type="file" name="imageFile" accept="image/*" />
          </TextFieldLabel>
  
          <Button type="submit">
            <Trans i18nKey={'department:createDepartmentSubmitButton'} />
          </Button>
        </div>
    </form>

  );
}