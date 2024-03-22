import { useCallback } from 'react';
import Trans from '~/core/ui/Trans';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SupabaseClient } from '@supabase/supabase-js'; // Assuming you have SupabaseClient imported properly
import ImageUploader from '~/core/ui/ImageUploader';

interface UploadLogoFormProps {
  currentLogoUrl: string | null | undefined;
  organizationId: number;
  onLogoUpdated: (url: string | null) => void;
  client: SupabaseClient; // Add SupabaseClient as a prop
  loadingMessage: string;
  successMessage: string;
  errorMessage: string;
  inputHeading: string;
  inputSubheading: string;
  bucketName: string
}

async function uploadLogo({
  client,
  organizationId,
  logo,
  bucketName,
}: {
  client: SupabaseClient;
  organizationId: number;
  logo: File;
  bucketName: string;
}) {
  const bytes = await logo.arrayBuffer();
  const bucket = client.storage.from(bucketName);
  const fileName = await getLogoName(logo.name, organizationId);

  const result = await bucket.upload(fileName, bytes, {
    upsert: true,
    contentType: logo.type,
  });

  if (!result.error) {
    return bucket.getPublicUrl(fileName).data.publicUrl;
  }

  throw result.error;
}

async function getLogoName(fileName: string, organizationId: number) {
  const { nanoid } = await import('nanoid');
  const uniqueId = nanoid(16);
  const extension = fileName.split('.').pop();

  return `${organizationId}.${extension}?v=${uniqueId}`;
}

async function deleteLogo(client: SupabaseClient, url: string, bucketName: string) {
  const bucket = client.storage.from(bucketName);
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return Promise.reject(new Error('Invalid file name'));
  }

  return bucket.remove([fileName]);
}

function UploadLogoForm(props: UploadLogoFormProps) {
  const { currentLogoUrl, organizationId, onLogoUpdated, client, loadingMessage, successMessage, errorMessage, inputHeading, inputSubheading, bucketName } = props;
  const { t } = useTranslation();

  const createToaster = useCallback(
    (promise: Promise<unknown>) => {
      return toast.promise(promise, {
        loading: loadingMessage,
        success: successMessage,
        error: errorMessage,
      });
    },
    [loadingMessage, successMessage, errorMessage],
  );

  const onValueChange = useCallback(
    async (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (currentLogoUrl) {
          return deleteLogo(client, currentLogoUrl, bucketName);
        }
        return Promise.resolve();
      };

      if (file) {
        const promise = removeExistingStorageFile()
          .then(() =>
            uploadLogo({
              client,
              organizationId,
              logo: file,
              bucketName
            }),
          )
          .then((url) => {
            onLogoUpdated(url);
          });

        createToaster(promise);
      } else {
        const promise = removeExistingStorageFile().then(() => {
          onLogoUpdated(null);
        });

        createToaster(promise);
      }
    },
    [client, createToaster, currentLogoUrl, onLogoUpdated, organizationId, bucketName],
  );

  return (
    <ImageUploader value={currentLogoUrl} onValueChange={onValueChange}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm'}>
          <Trans>{inputHeading}</Trans>
        </span>

        <span className={'text-xs'}>
          <Trans>{inputSubheading}</Trans>
        </span>
      </div>
    </ImageUploader>
  );
}

export default UploadLogoForm;
