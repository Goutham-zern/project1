'use client';

import { useState } from 'react';
import useQuery from 'swr';
import useMutation from 'swr/mutation';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import Label from '~/core/ui/Label';
import Stepper from '~/core/ui/Stepper';
import If from '~/core/ui/If';
import Spinner from '~/core/ui/Spinner';
import Alert from '~/core/ui/Alert';
import useCsrfToken from '~/core/hooks/use-csrf-token';
import { createChatbotCrawlingJob, getSitemapLinks } from '../actions.server';

function CrawlWebsiteModal(
  props: React.PropsWithChildren<{
    url: string;
    chatbotId: number;
  }>,
) {
  return (
    <Modal Trigger={props.children} heading={'Crawl Website'}>
      <ModalForm url={props.url} chatbotId={props.chatbotId} />
    </Modal>
  );
}

export default CrawlWebsiteModal;

function ModalForm(
  props: React.PropsWithChildren<{
    url: string;
    chatbotId: number;
  }>,
) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Website', 'Analyze', 'Confirm'];
  const crawlingJobMutation = useStartCrawlingJob();

  const isStep = (step: number) => currentStep === step;

  const onStartCrawling = async () => {
    await crawlingJobMutation.trigger(props.chatbotId);

    setCurrentStep(2);
  };

  return (
    <div className={'flex flex-col space-y-12'}>
      <Stepper
        steps={steps}
        currentStep={currentStep}
      />

      <If condition={isStep(0)}>
        <ConfirmWebsiteStep url={props.url} onNext={() => setCurrentStep(1)} />
      </If>

      <If condition={isStep(1)}>
        <AnalyzeWebsiteSitemapStep
          isCreatingJob={crawlingJobMutation.isMutating}
          url={props.url}
          chatbotId={props.chatbotId}
          onNext={onStartCrawling}
        />
      </If>

      <If condition={isStep(2)}>
        <ConfirmCrawlingStep chatbotId={props.chatbotId} />
      </If>
    </div>
  );
}

function ConfirmWebsiteStep(
  props: React.PropsWithChildren<{
    url: string;
    onNext: () => unknown;
  }>,
) {
  return (
    <div className={'flex flex-col space-y-4 text-sm animate-in fade-in'}>
      <div className={'flex flex-col space-y-2'}>
        <p>
          Let's crawl your website to train your chatbot with your existing content. We will analyze your website and create a list of questions and answers for your chatbot.
        </p>

        <p>
          If the website below is not correct, please update it in the chatbot settings.
        </p>
      </div>

      <div>
        <Label>
          <span>Website URL</span>
        </Label>

        <pre className={'text-xs bg-gray-50 dark:bg-dark-950 border p-4 mt-2'}>
          <code>{props.url}</code>
        </pre>
      </div>

      <div>
        <Button type={'button'} block onClick={props.onNext}>
          Analyze
        </Button>
      </div>
    </div>
  );
}

function ConfirmCrawlingStep(props: React.PropsWithChildren<{
  chatbotId: number
}>) {
  return (
    <div className={'flex flex-col space-y-4 text-sm animate-in fade-in'}>
     <Alert type={'success'}>
       <Alert.Heading>
         Crawling Started
       </Alert.Heading>

       We are crawling your website. This will take a few minutes. We will notify you when it's done.
     </Alert>

      <div>
        <Button block href={`../${props.chatbotId}/training`}>
          <span>
            Check Status
          </span>
        </Button>
      </div>
    </div>
  );
}

function AnalyzeWebsiteSitemapStep(
  props: React.PropsWithChildren<{
    url: string;
    isCreatingJob: boolean;
    chatbotId: number;
    onNext: () => unknown;
  }>,
) {
  const { isLoading, data, error } = useSitemapLinks(props.chatbotId, props.url);

  if (props.isCreatingJob) {
    return (
      <div className={'flex flex-col space-y-4 text-sm animate-in fade-in items-center justify-center'}>
        <Spinner />

        <p>
          Just a moment...
        </p>

        <p>
          We are about to train your chatbot on your website.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={'flex flex-col space-y-4 text-sm animate-in fade-in items-center justify-center'}>
        <Spinner />

        <p>
          We are analyzing your website...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type={'error'}>
        <Alert.Heading>
          Website Analysis Failed
        </Alert.Heading>

        <p>
          Sorry, we encountered an error while analyzing your website.
        </p>
      </Alert>
    )
  }

  return (
    <div className={'flex flex-col space-y-4 text-sm animate-in fade-in'}>
      <div className={'flex flex-col space-y-2'}>
        <p>
          We found a sitemap for <code className={'text-xs'}>{props.url}</code>.
        </p>

        <p>
          The sitemap contains <strong>{data?.numberOfPages}</strong> pages. Do you want to start crawling?
        </p>

        <p>
          This will take a few minutes. We will notify you when it's done.
        </p>
      </div>

      <div>
        <Button type={'button'} block onClick={props.onNext}>
          Yes, Start Crawling
        </Button>
      </div>
    </div>
  );
}

function useStartCrawlingJob() {
  const csrfToken = useCsrfToken();

  function mutationFn(chatbotId: number) {
    return createChatbotCrawlingJob({ chatbotId, csrfToken });
  }

  return useMutation(
    ['start-crawling-job'],
    (_, { arg }: { arg: number }) => {
      return mutationFn(arg);
    },
  );
}

function useSitemapLinks(chatbotId: number, url: string) {
  const csrfToken = useCsrfToken();

  return useQuery(['sitemap-links', chatbotId, url], async () => {
    return getSitemapLinks({ chatbotId, csrfToken });
  });
}
