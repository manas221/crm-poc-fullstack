import type { ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';
import { AlertCircleIcon } from '../icons';

type AlertVariant = 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  /** Shown before the message; defaults to an alert icon for errors. */
  icon?: ReactNode;
  /** Shown on the right, e.g. a Retry button. */
  action?: ReactNode;
}

const VARIANTS: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-gray-200 bg-gray-50 text-gray-700',
};

export function Alert({ variant, children, icon, action }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-center gap-3 rounded-lg border px-4 py-3 text-sm', VARIANTS[variant])}
    >
      <span className="shrink-0">{icon ?? (variant === 'error' && <AlertCircleIcon className="size-5" />)}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
