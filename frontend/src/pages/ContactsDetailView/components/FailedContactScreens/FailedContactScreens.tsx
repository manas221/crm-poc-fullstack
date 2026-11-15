import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { EmptyState } from '../../../../components/EmptyState';
import { UserIcon } from '../../../../components/icons';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { FailedContactStatus } from '../../contactsDetailView.types.ts';
import { BackToContactsLink } from '../BackToContactsLink';

interface FailedContactScreensProps {
  status: FailedContactStatus;
  /** "Back to contacts" (see useBackToContacts). */
  onBack: () => void;
  /** Refetches the contact after a load error. */
  onRetry: () => void;
}

/** The whole page when there's no contact to show: "Contact not found", or a load error with Retry. */
export function FailedContactScreens({ status, onBack, onRetry }: FailedContactScreensProps) {
  return (
    <section className="space-y-6">
      <BackToContactsLink onBack={onBack} />

      {status === DETAIL_VIEW_STATUS.NOT_FOUND ? (
        <EmptyState
          icon={
            <span className="flex size-14 items-center justify-center rounded-full bg-gray-100">
              <UserIcon className="size-7" />
            </span>
          }
          title={DETAIL_VIEW_TEXT.NOT_FOUND.TITLE}
          description={DETAIL_VIEW_TEXT.NOT_FOUND.DESCRIPTION}
          action={<Button onClick={onBack}>{DETAIL_VIEW_TEXT.BACK_TO_CONTACTS}</Button>}
        />
      ) : (
        <Alert
          variant="error"
          action={
            <Button variant="danger-outline" onClick={onRetry}>
              {DETAIL_VIEW_TEXT.LOAD_ERROR.RETRY}
            </Button>
          }
        >
          {DETAIL_VIEW_TEXT.LOAD_ERROR.MESSAGE}
        </Alert>
      )}
    </section>
  );
}
