import { Button } from '../../../../components/Button';
import { PencilIcon } from '../../../../components/icons';
import { Skeleton } from '../../../../components/Skeleton';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { ContactDetailData } from '../../contactsDetailView.types.ts';

interface ContactHeaderProps {
  data: ContactDetailData;
  isEditing: boolean;
  onEdit: () => void;
}

/** The contact's name and company, and the Edit button (hidden while editing: Save/Cancel take over). */
export function ContactHeader({ data, isEditing, onEdit }: ContactHeaderProps) {
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
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold break-words text-gray-900">
          {firstName} {lastName}
        </h1>
        {company && <p className="mt-1 text-base break-words text-gray-500">{company}</p>}
      </div>
      {!isEditing && (
        <Button className="shrink-0" onClick={onEdit}>
          <PencilIcon className="size-4" />
          {DETAIL_VIEW_TEXT.HEADER.EDIT}
        </Button>
      )}
    </header>
  );
}
