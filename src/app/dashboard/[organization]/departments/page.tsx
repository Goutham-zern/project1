import React from 'react'
import SubHeading from '~/core/ui/SubHeading';
import Trans from '~/core/ui/Trans';
import { withI18n } from '~/i18n/with-i18n';
import AppHeader from '../components/AppHeader';
import CreateChatbotModal from '../components/CreateChatbotModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { PageBody } from '~/core/ui/Page';
import Button from '~/core/ui/Button';
import DepartmentList from './components/departmentList';
import CreateDepartmentButton from './components/CreateDepartmentButton';
const departments = ({ searchParams } : { searchParams: {success: string} } ) => {

    return (
    <>
      <AppHeader
        title={<Trans i18nKey={'department:departmentHeading'} />}
        description={<Trans i18nKey={'department:departmentSubHeading'} />}
      >
        <CreateDepartmentButton />
      </AppHeader>

      <PageBody>
        <DepartmentList />
      </PageBody>
    </>
      );
}

export default withI18n(departments);
