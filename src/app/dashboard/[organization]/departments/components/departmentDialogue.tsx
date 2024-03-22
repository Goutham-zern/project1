import React from 'react';

import UploadLogoForm from '../../components/LogoUploadForm'; // Import the UploadLogoForm component
import TextField from '~/core/ui/TextField';
import Trans from '~/core/ui/Trans';
import Button from '~/core/ui/Button';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface DepartmentDialogueProps {
    departmentData: {
        id: number;
        name: string;
        image_url: string;
        // Add any other department attributes here
    };
    onClose: () => void;
    onLogoUpdated: () => void;
    client: any;
}

const DepartmentDialogue: React.FC<DepartmentDialogueProps> = ({ departmentData, onClose, onLogoUpdated, client  }) => {
    const handleLogoUpdated = () => {
        // Handle logo updated logic
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-md p-4 w-96">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    <ChatBubbleOvalLeftEllipsisIcon />
                </button>
                <UploadLogoForm
      currentLogoUrl={departmentData.image_url}
      organizationId={departmentData.id}
      onLogoUpdated={onLogoUpdated}
      client={client}
      loadingMessage={"common:departmentLogoLoading"}
      successMessage={"common:departmentLogoSuccess"}
      errorMessage={"common:departmentLogoError"}
      inputHeading={"common:departmentLogoInputHeading"}
      inputSubheading={"common:departmentLogoInputSubheading"}
      bucketName={"department_images"}
     />        

      <form
        // onSubmit={handleSubmit((value) => onSubmit(value.name))}
        className={'flex flex-col space-y-4'}
      >
        <TextField>
          <TextField.Label>
            <Trans i18nKey={'organization:organizationNameInputLabel'} />

            <TextField.Input
              data-cy={'organization-name-input'}
              required
              placeholder={''}
            />
          </TextField.Label>
        </TextField>

        <div>
          <Button
            className={'w-full md:w-auto'}
            data-cy={'update-organization-submit-button'}
            loading={false}
          >
            <Trans i18nKey={'organization:updateOrganizationSubmitLabel'} />
          </Button>
        </div>
      </form>
            </div>
        </div>
    );
};

export default DepartmentDialogue;
