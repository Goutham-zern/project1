import React from 'react'
import SubHeading from '~/core/ui/SubHeading';
import Trans from '~/core/ui/Trans';
import { withI18n } from '~/i18n/with-i18n';
import AppHeader from '../components/AppHeader';
import CreateChatbotModal from '../components/CreateChatbotModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { PageBody } from '~/core/ui/Page';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';
import DepartmentList from './components/departmentList';
import CreateDepartmentModal from './components/createDepartmentModel';

const departments = () => {
    return (
    <>
      <AppHeader
        title={<Trans i18nKey={'common:departmentHeading'} />}
        description={<Trans i18nKey={'common:departmentSubHeading'} />}
      >
        <CreateDepartmentModal canCreateDepartment={true}>
          <Button size={'sm'} variant={'outline'}>
            <PlusCircleIcon className={'w-4 mr-2'} />

            <span>Add Department</span>
          </Button>
        </CreateDepartmentModal>
      </AppHeader>

      <PageBody>
        <DepartmentList />
      </PageBody>
    </>
      );
}

export default withI18n(departments);
