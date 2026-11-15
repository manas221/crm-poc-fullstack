import { Skeleton } from '../../../../components/Skeleton';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { ContactDetailData } from '../../contactsDetailView.types.ts';

/** The contact's name and company (skeleton bars while loading). */
export function ContactHeader({ data }: { data: ContactDetailData }) {
  if (data.status === DETAIL_VIEW_STATUS.LOADING) {
    return (
      <header className="space-y-3" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-36" />
        <p role="status" className="sr-only">
          {DETAIL_VIEW_TEXT.HEADER.LOADING}
        </p>
      </header>
    );
  }
  if (data.status !== DETAIL_VIEW_STATUS.READY) {
    return null;
  }

  const { firstName, lastName, company } = data.contact;
  return (
    <header className="min-w-0">
      <h1 className="text-3xl font-semibold break-words text-gray-900">
        {firstName} {lastName}
      </h1>
      {company && <p className="mt-1 text-base break-words text-gray-500">{company}</p>}
    </header>
  );
}
