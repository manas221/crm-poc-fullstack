import { COPY_STATUS, COPY_TEXT } from '../../constants/clipboard.ts';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.ts';
import { cn } from '../../utils/cn.ts';
import { CheckIcon, CopyIcon, XIcon } from '../icons';

interface CopyButtonProps {
  /** What gets copied. */
  text: string;
  /** Accessible name, e.g. "Copy email asha@acme.com". Also the hover tooltip. */
  label: string;
  className?: string;
}

/**
 * Icon button that copies `text`; briefly shows a check (or a cross if copying failed).
 * `data-status` (idle / copied / failed) lets a parent style it, e.g. keep a hover-only button
 * visible while it shows the result.
 */
export function CopyButton({ text, label, className }: CopyButtonProps) {
  const { status, copy } = useCopyToClipboard();

  const Icon = status === COPY_STATUS.COPIED ? CheckIcon : status === COPY_STATUS.FAILED ? XIcon : CopyIcon;

  return (
    <>
      <button
        type="button"
        onClick={() => void copy(text)}
        aria-label={label}
        title={label}
        data-status={status}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded p-1 transition-colors',
          'focus-visible:outline-2 focus-visible:outline-blue-600',
          status === COPY_STATUS.COPIED && 'text-green-600',
          status === COPY_STATUS.FAILED && 'text-red-600',
          status === COPY_STATUS.IDLE && 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
          className,
        )}
      >
        <Icon className="size-3.5" />
      </button>
      <span role="status" className="sr-only">
        {status === COPY_STATUS.COPIED ? COPY_TEXT.COPIED : status === COPY_STATUS.FAILED ? COPY_TEXT.FAILED : ''}
      </span>
    </>
  );
}
