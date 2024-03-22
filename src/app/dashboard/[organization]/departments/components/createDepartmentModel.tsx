import { redirect } from 'next/navigation';
import { z } from 'zod';

import Modal from '~/core/ui/Modal';
import { TextFieldHint, TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';

import getSupabaseServerActionClient from '~/core/supabase/action-client';
import getSdk from '~/lib/sdk';

import Textarea from '~/core/ui/Textarea';
import ErrorBoundary from '~/core/ui/ErrorBoundary';
import { Alert, AlertHeading } from '~/core/ui/Alert';
import If from '~/core/ui/If';
import Button from '~/core/ui/Button';
import Trans from '~/core/ui/Trans';

function CreateDepartmentModal(
  props: React.PropsWithChildren<{
    canCreateDepartment: boolean;
  }>,
) {
  return (
    <Modal Trigger={props.children} heading={<Trans i18nKey={'department:createDepartmentModalHeading'} />}>
      <If
        condition={props.canCreateDepartment}
        fallback={<CannotCreateDepartmentAlert />}
      >
        <ErrorBoundary fallback={<DepartmentErrorAlert />}>
          <CreateDepartmentForm />
        </ErrorBoundary>
      </If>
    </Modal>
  );
}

export default CreateDepartmentModal;

function CreateDepartmentForm() {
  return (
    <form action={createDepartmentAction}>
      <div className={'flex flex-col space-y-4'}>
        <div>
          <p className={'text-sm text-gray-500'}>
            <Trans i18nKey={'department:createDepartmentModalSubheading'} />
          </p>
        </div>

        <TextFieldLabel>
          <Trans i18nKey={'department:departmentName'} />
          <TextFieldInput
            name={'name'}
            required
            placeholder={'Ex. Sales Department'}
          />
        </TextFieldLabel>

        <TextFieldLabel>
          <Trans i18nKey={'department:departmentDescription'} />
          <Textarea name={'description'} placeholder={'Description...'} />
        </TextFieldLabel>

        <Button>
          <Trans i18nKey={'department:createDepartmentSubmitButton'} />
        </Button>
      </div>
    </form>
  );
}

function DepartmentErrorAlert() {
  return (
    <Alert type={'error'}>
      <AlertHeading>
        <Trans i18nKey={'department:createDepartmentAlertError'} />
      </AlertHeading>
      <Trans i18nKey={'department:createDepartmentAlertErrorDescription'} />
    </Alert>
  );
}

function CannotCreateDepartmentAlert() {
  return (
    <Alert type={'warn'}>
      <AlertHeading>
        <Trans i18nKey={'department:cannotCreateDepartment'} />
      </AlertHeading>
      <Trans i18nKey={'department:cannotCreateDepartmentDescription'} />
    </Alert>
  );
}

async function createDepartmentAction(data: FormData) {
  'use server';

  const name = z.string().min(2).parse(data.get('name'));
  const description = z.string().optional().parse(data.get('description'));

  const client = getSupabaseServerActionClient();
  const sdk = getSdk(client);

  const organization = await sdk.organization.getCurrent();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Add logic to insert department to database using Supabase SDK or other method
  
  redirect(`/dashboard/${organization.uuid}/departments`); // Redirect after successful creation
}
