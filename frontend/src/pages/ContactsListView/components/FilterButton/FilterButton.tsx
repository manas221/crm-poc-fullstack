import type { ComponentProps } from 'react';
import { ChevronDownIcon } from '../../../../components/icons';
import { cn } from '../../../../utils/cn.ts';

interface FilterButtonProps extends ComponentProps<'button'> {
  label: string;
  /** What the filter is set to; shown as "Label: value" and highlights the button. */
  value?: string;
}

/**
 * The trigger of a filter dropdown. Meant to be rendered by a Headless UI button through
 * `as={FilterButton}`, which passes the ref, the ARIA attributes and `data-open`.
 */
export function FilterButton({ label, value, className, ...props }: FilterButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex max-w-72 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm text-gray-900 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        value ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : 'border-gray-300 bg-white hover:bg-gray-50',
        // Open wins over active: a white button with a blue border, as in the mockups.
        'data-open:border-blue-500 data-open:bg-white',
        className,
      )}
      {...props}
    >
      <span className="truncate">
        {label}
        {value && (
          <>
            : <strong className="font-semibold">{value}</strong>
          </>
        )}
      </span>
      <ChevronDownIcon className="size-4 shrink-0 text-gray-500" />
    </button>
  );
}
