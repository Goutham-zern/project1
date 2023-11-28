'use client';

import { ColumnDef, Row } from '@tanstack/react-table';

import { getJobs } from '~/lib/jobs/queries';
import DataTable from '~/core/ui/DataTable';
import Badge from '~/core/ui/Badge';

type Jobs = Awaited<ReturnType<typeof getJobs>>['data'];

const columns: Array<ColumnDef<Jobs[0]>> = [
  {
    header: 'Created At',
    id: 'createdAt',
    cell: ({ row }) => {
      return <DateRenderer row={row} accessorKey={'createdAt'} />;
    }
  },
  {
    header: 'Status',
    id: 'status',
    cell: ({ row }) => {
      return <JobStatusBadge status={row.original.status} />;
    },
  },
  {
    header: 'Tasks Completed',
    id: 'completedTasks',
    accessorKey: 'tasksCompleted',
  },
  {
    header: 'Tasks Total',
    id: 'totalTasks',
    accessorKey: 'tasksCount',
  },
];

function JobsTable(props: {
  jobs: Jobs;
  page: number;
  perPage: number;
  count: number;
}) {
  const pageCount = Math.ceil(props.count / props.perPage);

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
          Failed
        </Badge>
      );

    case 'completed':
      return (
        <Badge className={'inline-flex'} size={'small'} color={'success'}>
          Completed
        </Badge>
      );

    case 'running':
      return (
        <Badge color={'info'} className={'inline-flex'} size={'small'}>
          Running
        </Badge>
      );

    case 'pending':
      return (
        <Badge className={'inline-flex'} size={'small'}>
          Pending
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
