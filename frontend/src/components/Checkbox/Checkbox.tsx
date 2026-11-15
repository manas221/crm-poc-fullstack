import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn.ts';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** The "some but not all" dash. Only settable from JS, so it's applied through the ref. */
  indeterminate?: boolean;
}

/** A native checkbox (keyboard and screen reader support for free), tinted with accent-color. */
export function Checkbox({ indeterminate = false, className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      ref={(element) => {
        if (element) {
          element.indeterminate = indeterminate;
        }
      }}
      className={cn(
        'size-4 cursor-pointer rounded border-gray-300 align-middle accent-blue-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
