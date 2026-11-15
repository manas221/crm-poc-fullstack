import { useId, type ReactNode } from 'react';

interface DetailCardProps {
  title: string;
  /** Small text on the right of the title, e.g. "Editing" or "Changes save automatically". */
  aside?: ReactNode;
  children?: ReactNode;
}

/** The bordered, titled card that holds each section of the page (details, activity, tags). */
export function DetailCard({ title, aside, children }: DetailCardProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
        <h2 id={titleId} className="text-base font-semibold text-gray-900">
          {title}
        </h2>
        {aside && <span className="text-sm text-gray-500">{aside}</span>}
      </header>
      {children && <div className="p-5">{children}</div>}
    </section>
  );
}
