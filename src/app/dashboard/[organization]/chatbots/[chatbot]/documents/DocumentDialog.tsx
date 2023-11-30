'use client';

import { useEffect, useState } from 'react';
import useQuery from 'swr';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

import SideDialog from '~/core/ui/SideDialog';
import { DialogTitle } from '~/core/ui/Dialog';
import { getDocumentById } from '~/lib/chatbots/queries';
import useSupabase from '~/core/hooks/use-supabase';
import If from '~/core/ui/If';
import Spinner from '~/core/ui/Spinner';
import MarkdownRenderer from '~/core/ui/markdown/MarkdownRenderer';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/core/ui/Dropdown';

import DeleteDocumentModal from '~/app/dashboard/[organization]/chatbots/[chatbot]/components/DeleteDocumentModal';
import Alert from '~/core/ui/Alert';

function DocumentDialog() {
  const params = useSearchParams();
  const value = params.get('document');
  const [docId, setDocId] = useState(value);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    setDocId(value);
  }, [value]);

  if (!docId) {
    return null;
  }

  return (
    <SideDialog open={!!value} onOpenChange={open => {
      if (!open) {
        setDocId(null);
        // remove the query param from the url when the dialog is closed
        router.replace(pathName);
      }
    }}>
      <DocumentContent document={docId} onBeforeDelete={() => setDocId(null)} />
    </SideDialog>
  );
}

export default DocumentDialog;

function DocumentContent(props: {
  document: string;
  onBeforeDelete?: () => void;
}) {
  const { data, isLoading, error } = useFetchDocument(props.document);

  if (error) {
    return (
      <Alert type={'warn'}>
        <Alert.Heading>This document does not exist.</Alert.Heading>
        Sorry about that! This document may have been deleted.
      </Alert>
    );
  }

  return (
    <>
      <If condition={isLoading}>
        <div className={'flex items-center space-x-4'}>
          <Spinner />

          <span>Loading...</span>
        </div>
      </If>

      <If condition={data}>
        {(doc) => (
          <div className={'flex flex-col space-y-6 divide-y w-full'}>
            <div className={'flex justify-between w-full items-center'}>
              <DialogTitle>{doc.metadata.title}</DialogTitle>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVerticalIcon className={'w-5'} />
                </DropdownMenuTrigger>

                <DropdownMenuContent collisionPadding={{ right: 20 }}>
                  <DeleteDocumentModal
                    onBeforeDelete={props.onBeforeDelete}
                    documentId={doc.id}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Delete
                    </DropdownMenuItem>
                  </DeleteDocumentModal>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div
              className={
                'overflow-y-auto h-full w-full absolute pb-36 top-10 -m-6 p-6'
              }
            >
              <MarkdownRenderer>{doc.content}</MarkdownRenderer>
            </div>
          </div>
        )}
      </If>
    </>
  );
}

function useFetchDocument(document: string) {
  const client = useSupabase();
  const key = ['documents', document];

  return useQuery(key, async () => {
    const { data, error } = await getDocumentById(client, +document);

    if (error) {
      throw error;
    }

    return data;
  });
}
