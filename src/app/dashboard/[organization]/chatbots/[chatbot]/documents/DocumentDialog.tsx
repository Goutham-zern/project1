'use client';

import { useEffect, useState } from 'react';
import useQuery from 'swr';
import { useSearchParams } from 'next/navigation';

import SideDialog from '~/core/ui/SideDialog';
import { DialogTitle } from '~/core/ui/Dialog';
import { getDocumentById } from '~/lib/chatbots/queries';
import useSupabase from '~/core/hooks/use-supabase';
import If from '~/core/ui/If';
import Spinner from '~/core/ui/Spinner';
import MarkdownRenderer from '~/components/MarkdownRenderer';

function DocumentDialog() {
  const params = useSearchParams();
  const value = params.get('document');

  const [open, setOpen] = useState(!!value);
  const [docId, setDocId] = useState(value);

  useEffect(() => {
    setDocId(value);

    if (value) {
      setOpen(true);
    }
  }, [value]);

  if (!docId) {
    return null;
  }

  return (
    <SideDialog open={open} onOpenChange={setOpen}>
      <DocumentContent document={docId} />
    </SideDialog>
  );
}

export default DocumentDialog;

function DocumentContent(props: {
  document: string;
}) {
  const {data, isLoading} = useFetchDocument(props.document);

  return (
    <>
      <If condition={isLoading}>
        <div className={'flex items-center space-x-4'}>
          <Spinner />

          <span>
            Loading...
          </span>
        </div>
      </If>

      <If condition={data}>
        {doc => (
          <div className={'flex flex-col space-y-6'}>
            <DialogTitle className={'pb-4'}>
              {doc.metadata.title}
            </DialogTitle>

            <div className={'overflow-y-auto h-full absolute py-8 pb-36'}>
              <MarkdownRenderer className={''}>
                {doc.content}
              </MarkdownRenderer>
            </div>
          </div>
        )}
      </If>
    </>
  )
}

function useFetchDocument(document: string) {
  const client = useSupabase();
  const key = ['documents', document];

  return useQuery(key, async () => {
    const { data, error } =  await getDocumentById(client, +document);

    if (error) {
      throw error;
    }

    return data;
  });
}
