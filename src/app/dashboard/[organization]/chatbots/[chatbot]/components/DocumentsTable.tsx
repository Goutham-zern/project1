'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

import DataTable from '~/core/ui/DataTable';
import type { getChatbotDocuments } from '~/lib/chatbots/queries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/core/ui/Dropdown';
import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import { deleteDocumentAction } from '~/app/dashboard/[organization]/chatbots/[chatbot]/actions.server';
import DeleteDocumentModal from '~/app/dashboard/[organization]/chatbots/[chatbot]/components/DeleteDocumentModal';

type Data = Awaited<ReturnType<typeof getChatbotDocuments>>;

interface DocumentTableProps extends Data {
  count: number;
  perPage: number;
  page: number;
  query: string;
}

interface DocMetadata {
  title: string;
  url: string;
  chatbot_id: number;
  organization_id: number;
}

function DocumentsTable(props: DocumentTableProps) {
  const columns = useMemo(() => getColumns(), []);

  return <DataTable data={props.data} columns={columns} />;
}

export default DocumentsTable;

function getColumns(): ColumnDef<Data['data'][0]>[] {
  return [
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const doc = row.original;
        const metadata = doc.metadata as unknown as DocMetadata;

        return (
          <Link href={`documents?document=${doc.id}`}>{metadata.title}</Link>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const value = row.original.createdAt;

        return new Date(value).toLocaleDateString();
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const doc = row.original;

        return (
          <div className={'flex justify-end'}>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVerticalIcon className={'h-4'} />
              </DropdownMenuTrigger>

              <DropdownMenuContent collisionPadding={{ right: 50 }}>
                <DropdownMenuItem asChild>
                  <Link href={`documents?document=${doc.id}`}>View</Link>
                </DropdownMenuItem>

                <DeleteDocumentModal documentId={doc.id}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Delete
                  </DropdownMenuItem>
                </DeleteDocumentModal>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
