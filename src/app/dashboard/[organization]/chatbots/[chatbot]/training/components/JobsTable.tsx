'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { getJobs } from '~/lib/jobs/queries';
import DataTable from '~/core/ui/DataTable';
import Badge from '~/core/ui/Badge';
import Trans from '~/core/ui/Trans';

type Jobs = Awaited<ReturnType<typeof getJobs>>['data'];

function JobsTable(props: {
  jobs: Jobs;
  page: number;
  perPage: number;
  count: number;
}) {
  const pageCount = Math.ceil(props.count / props.perPage);
  const columns = useColumns();

  return (
    <div>
      <DataTable
        data={props.jobs ?? []}
        pageCount={pageCount}
        pageSize={props.perPage}
        pageIndex={props.page - 1}
        columns={columns}
      />
    </div>
  );
}

export default JobsTable;

function JobStatusBadge({ status }: { status: Jobs[0]['status'] }) {
  switch (status) {
    case 'failed':
      return (
        <Badge className={'inline-flex'} size={'small'} color={'error'}>
          <Trans i18nKey={'chatbot:jobFailed'} />
        </Badge>
      );

    case 'completed':
      return (
        <Badge className={'inline-flex'} size={'small'} color={'success'}>
          <Trans i18nKey={'chatbot:jobCompleted'} />
        </Badge>
      );

    case 'pending':
      return (
        <Badge className={'inline-flex'} size={'small'}>
          <Trans i18nKey={'chatbot:jobInProgress'} />
        </Badge>
      );
  }
}

function DateRenderer({
  row,
  accessorKey,
}: React.PropsWithChildren<{
  row: Row<Jobs[0]>;
  accessorKey: keyof Jobs[0];
}>) {
  const doc = row.original;

  if (accessorKey in doc && doc[accessorKey]) {
    const value = doc[accessorKey] as string;

    return <span>{new Date(value).toDateString()}</span>;
  }

  return <>-</>;
}

function useColumns() {
  const { t } = useTranslation('chatbot');

  const columns: Array<ColumnDef<Jobs[0]>> = [
    {
      header: t('createdAt'),
      id: 'createdAt',
      cell: ({ row }) => {
        return <DateRenderer row={row} accessorKey={'createdAt'} />;
      },
    },
    {
      header: t('jobStatus'),
      id: 'status',
      cell: ({ row }) => {
        return <JobStatusBadge status={row.original.status} />;
      },
    },
    {
      header: t('tasksCompleted'),
      id: 'completedTasks',
      accessorKey: 'tasksCompleted',
    },
    {
      header: t('tasksTotal'),
      id: 'totalTasks',
      accessorKey: 'tasksCount',
    },
  ];

  return columns;
}
