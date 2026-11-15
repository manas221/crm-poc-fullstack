import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';
import { AlertCircleIcon } from '../icons';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  /** Shown under the input, which is then marked invalid (red border, aria-invalid). */
  error?: string;
  className?: string;
}

/** A labelled text input with an optional error message, linked for screen readers. */
export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'mt-1.5 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
          'focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500',
          error
            ? 'border-red-500 ring-2 ring-red-500/15 focus:ring-red-500/25'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
