import { cn } from '../../utils/cn.ts';

/** A pulsing grey bar standing in for text that is still loading. Set the width via className. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('h-3 animate-pulse rounded bg-gray-200', className)} />;
}
