import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { UserIcon } from '../../components/icons';
import { Skeleton } from '../../components/Skeleton';
import { BackToContactsLink } from './components/BackToContactsLink';
import { ContactActivity } from './components/ContactActivity';
import { ContactDetails } from './components/ContactDetails';
import { ContactHeader } from './components/ContactHeader';
import { ContactTags } from './components/ContactTags';
import { DetailCard } from './components/DetailCard';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from './contactsDetailView.constants.ts';
import { isFailedContactData } from './contactsDetailView.helpers.ts';
import type { FailedContactStatus } from './contactsDetailView.types.ts';
import { useContactsDetailView } from './hooks/useContactsDetailView.ts';
interface FailedContactScreensProps {
  status: FailedContactStatus;
  onBack: () => void;
  onRetry: () => void;
}

/** The whole page when there's no contact to show: "Contact not found", or a load error with Retry. */
function FailedContactScreens({ status, onBack, onRetry }: FailedContactScreensProps) {
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

function SkeletonLines({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-20" />
          <Skeleton className="w-48" />
        </div>
      ))}
    </div>
  );
}

/** The page while the contact loads: same layout and card titles as the loaded page, with skeleton bars for the data. */
function LoadingContactScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="space-y-6" aria-busy="true">
      <BackToContactsLink onBack={onBack} />

      <header className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-36" />
      </header>
      <p role="status" className="sr-only">
        {DETAIL_VIEW_TEXT.HEADER.LOADING}
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.DETAILS}>
            <SkeletonLines count={5} />
          </DetailCard>
          <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.TAGS}>
            <SkeletonLines count={1} />
          </DetailCard>
        </div>
        <div className="lg:col-span-2">
          <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.ACTIVITY}>
            <SkeletonLines count={3} />
          </DetailCard>
        </div>
      </div>
    </section>
  );
}

export function ContactsDetailView() {
  const { contactData, activityData, contactTagsState, handleBack, handleRetry, handleActivityRetry } =
    useContactsDetailView();

  if (isFailedContactData(contactData)) {
    return <FailedContactScreens status={contactData.status} onBack={handleBack} onRetry={handleRetry} />;
  }

  if (contactData.status === DETAIL_VIEW_STATUS.LOADING) {
    return <LoadingContactScreen onBack={handleBack} />;
  }

  const { contact } = contactData;
  return (
    <section className="space-y-6">
      <BackToContactsLink onBack={handleBack} />

      <ContactHeader contact={contact} />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <ContactDetails key={contact.id} contact={contact} />
          <ContactTags contactTagsState={contactTagsState} />
        </div>
        <div className="lg:col-span-2">
          <ContactActivity activityData={activityData} onRetry={handleActivityRetry} />
        </div>
      </div>
    </section>
  );
}
