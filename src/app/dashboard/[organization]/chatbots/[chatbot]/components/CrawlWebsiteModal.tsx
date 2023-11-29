'use client';

import useQuery from 'swr';
import useMutation from 'swr/mutation';
import { Control, useFieldArray, useForm } from 'react-hook-form';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import Label from '~/core/ui/Label';
import Stepper from '~/core/ui/Stepper';
import If from '~/core/ui/If';
import Spinner from '~/core/ui/Spinner';
import Alert from '~/core/ui/Alert';
import useCsrfToken from '~/core/hooks/use-csrf-token';
import Heading from '~/core/ui/Heading';
import IconButton from '~/core/ui/IconButton';
import TextField from '~/core/ui/TextField';

import { createChatbotCrawlingJob, getSitemapLinks } from '../actions.server';

const initialFormValues = {
  currentStep: 0,
  filters: {
    allow: [{ value: '' }],
    disallow: [{ value: '' }],
  },
};

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
  const form = useForm({
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  const steps = ['Website', 'Analyze', 'Confirm'];
  const crawlingJobMutation = useStartCrawlingJob();

  const currentStep = form.watch('currentStep');
  const filters = form.watch('filters');

  const getFilters = () => {
    const allow = filters.allow.map((filter) => filter.value);
    const disallow = filters.disallow.map((filter) => filter.value);

    return {
      allow,
      disallow,
    }
  };

  const isStep = (step: number) => currentStep === step;

  const setStep = (step: number) => {
    form.setValue('currentStep', step);
  };

  const onStartCrawling = async () => {
    await crawlingJobMutation.trigger({
      chatbotId: props.chatbotId,
      filters: getFilters()
    });

    setStep(2);
  };

  return (
    <div className={'flex flex-col space-y-12'}>
      <Stepper steps={steps} currentStep={currentStep} />

      <If condition={isStep(0)}>
        <ConfirmWebsiteStep
          control={form.control}
          url={props.url}
          onNext={() => setStep(1)}
        />
      </If>

      <If condition={isStep(1)}>
        <AnalyzeWebsiteSitemapStep
          isCreatingJob={crawlingJobMutation.isMutating}
          url={props.url}
          chatbotId={props.chatbotId}
          filters={getFilters()}
          onNext={onStartCrawling}
          onBack={() => setStep(0)}
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
    control: Control<typeof initialFormValues>;
    onNext: () => unknown;
  }>,
) {
  return (
    <div className={'flex flex-col space-y-4 text-sm animate-in fade-in'}>
      <div className={'flex flex-col space-y-2'}>
        <p>
          Let's crawl your website to train your chatbot with your existing
          content. We will analyze your website and create a list of questions
          and answers for your chatbot.
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

      <CrawlingFiltersForm control={props.control} />

      <div>
        <Button type={'button'} block onClick={props.onNext}>
          Analyze
        </Button>
      </div>
    </div>
  );
}

function ConfirmCrawlingStep(
  props: React.PropsWithChildren<{
    chatbotId: number;
  }>,
) {
  return (
    <div className={'flex flex-col space-y-4 text-sm animate-in fade-in'}>
      <Alert type={'success'}>
        <Alert.Heading>Crawling Started</Alert.Heading>
        We are crawling your website. This will take a few minutes. We will
        notify you when it's done.
      </Alert>

      <div>
        <Button block href={`../${props.chatbotId}/training`}>
          <span>Check Status</span>
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
    filters: {
      allow: string[];
      disallow: string[];
    };
    onBack: () => unknown;
    onNext: () => unknown;
  }>,
) {
  const { isLoading, data, error } = useSitemapLinks(
    props.chatbotId,
    props.url,
    props.filters
  );

  if (props.isCreatingJob) {
    return (
      <div
        className={
          'flex flex-col space-y-4 text-sm animate-in fade-in items-center justify-center'
        }
      >
        <Spinner />

        <p>Just a moment...</p>

        <p>We are about to train your chatbot on your website.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={
          'flex flex-col space-y-4 text-sm animate-in fade-in items-center justify-center'
        }
      >
        <Spinner />

        <p>We are analyzing your website...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type={'error'}>
        <Alert.Heading>Website Analysis Failed</Alert.Heading>

        <p>Sorry, we encountered an error while analyzing your website.</p>
      </Alert>
    );
  }

  const totalNumberOfPages = data?.numberOfPages || 0;
  const numberOfFilteredPages = data?.numberOfFilteredPages || 0;

  return (
    <div className={'flex flex-col space-y-4 text-sm animate-in fade-in'}>
      <div className={'flex flex-col space-y-2'}>
        <p>
          We found a sitemap for <code className={'text-xs'}>{props.url}</code>.
        </p>

        <p>
          The sitemap contains a total of <strong>{totalNumberOfPages}</strong> pages. We found <strong>{numberOfFilteredPages}</strong> after applying the filters.
          Do you want to start crawling?
        </p>

        <p>This will take a few minutes. We will notify you when it's done.</p>
      </div>

      <div>
        <If condition={numberOfFilteredPages > 0}>
          <Button type={'button'} block onClick={props.onNext}>
            Yes, Start Crawling
          </Button>
        </If>
      </div>

      <div>
        <Button variant={'outline'} type={'button'} block onClick={props.onBack}>
          No, Go Back
        </Button>
      </div>
    </div>
  );
}

function CrawlingFiltersForm(
  props: React.PropsWithChildren<{
    control: Control<typeof initialFormValues>;
  }>,
) {
  const allowList = useFieldArray({
    control: props.control,
    name: 'filters.allow',
  });

  const disallowList = useFieldArray({
    control: props.control,
    name: 'filters.disallow',
  });

  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-2'}>
        <Heading type={5}>Allow URLs</Heading>

        <span className={'text-xs'}>
          Allow URLs that you want to include in your chatbot. Leave this empty
          to include all URLs. For example, if you only want to include all URLs
          that start with <code>/blog</code>, you can add <code>/blog</code> to
          the allow list.
        </span>

        <div className={'flex flex-col space-y-1'}>
          {allowList.fields.map((field, index) => {
            return (
              <div key={field.id} className={'flex items-center space-x-2'}>
                <TextField.Input
                  {...props.control.register(`filters.allow.${index}.value`)}
                  required
                  type={'text'}
                  className={'flex-1'}
                  placeholder={'Ex. /blog'}
                />

                <If condition={index > 0}>
                  <IconButton
                    type={'button'}
                    onClick={() => allowList.remove(index)}
                  >
                    <XMarkIcon className={'w-4 h-4'} />
                  </IconButton>
                </If>
              </div>
            );
          })}

          <div>
            <Button
              type={'button'}
              onClick={() => allowList.append({ value: '' })}
              size={'sm'}
              variant={'outline'}
            >
              <PlusIcon className={'h-3 mr-2'} />
              <span>Add URL</span>
            </Button>
          </div>
        </div>
      </div>

      <div className={'flex flex-col space-y-2'}>
        <Heading type={5}>Disallow URLs</Heading>
        <span className={'text-xs'}>
          Disallow URLs that you don't want to include in your chatbot. For
          example, if you want to exclude the URLs starting with{' '}
          <code>/docs</code> from your chatbot, you can add <code>/docs</code>{' '}
          to the disallow list.
        </span>

        <div className={'flex flex-col space-y-1.5'}>
          {disallowList.fields.map((field, index) => {
            return (
              <div key={field.id} className={'flex items-center space-x-2'}>
                <TextField.Input
                  {...props.control.register(`filters.disallow.${index}.value`)}
                  required
                  type={'text'}
                  className={'flex-1'}
                  placeholder={'Ex. /docs'}
                />

                <If condition={index > 0}>
                  <IconButton
                    type={'button'}
                    onClick={() => disallowList.remove(index)}
                  >
                    <XMarkIcon className={'w-4 h-4'} />
                  </IconButton>
                </If>
              </div>
            );
          })}

          <div>
            <Button
              type={'button'}
              onClick={() => disallowList.append({ value: '' })}
              size={'sm'}
              variant={'outline'}
            >
              <PlusIcon className={'h-3 mr-2'} />
              <span>Add URL</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useStartCrawlingJob() {
  const csrfToken = useCsrfToken();

  type Params = {
    chatbotId: number;
    filters:{
      allow: string[];
      disallow: string[];
    }
  };

  return useMutation(['start-crawling-job'], (_, { arg }: { arg: Params }) => {
    return createChatbotCrawlingJob({ ...arg, csrfToken });
  });
}

function useSitemapLinks(chatbotId: number, url: string, filters: {
  allow: string[];
  disallow: string[];
}) {
  const csrfToken = useCsrfToken();
  const key = ['sitemap-links', chatbotId, url, JSON.stringify(filters)];

  return useQuery(key, async () => {
    return getSitemapLinks({ chatbotId, csrfToken, filters });
  });
}
