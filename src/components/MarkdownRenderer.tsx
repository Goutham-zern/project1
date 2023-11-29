import { memo } from 'react';
import Markdown from 'markdown-to-jsx';

const MemoizedReactMarkdown = memo(
  Markdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);

export default function MarkdownRenderer(
  props: React.PropsWithChildren<{ className: string; children: string }>,
) {
  return (
    <MemoizedReactMarkdown
      className={props.className}
      overrides={{
        p: {
          className: 'my-1'
        },
        ol: {
          className: 'list-decimal list-inside pl-2 my-1'
        },
        ul: {
          className: 'list-disc list-inside pl-2 my-1'
        },
        pre: {
          className: 'p-4 bg-gray-200 dark:bg-dark-700 break-words rounded-lg my-4 whitespace-break-spaces text-sm'
        }
      }}
    >
      {props.children}
    </MemoizedReactMarkdown>
  );
}
