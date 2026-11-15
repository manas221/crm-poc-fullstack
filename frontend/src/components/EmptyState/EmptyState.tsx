import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Centered message for "nothing to show": no results, not found, no activity yet. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      {icon && <div className="mb-1 text-gray-400">{icon}</div>}
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
