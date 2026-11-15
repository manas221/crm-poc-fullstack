import { BackToContactsLink } from './components/BackToContactsLink';
import { ContactHeader } from './components/ContactHeader';
import { DetailCard } from './components/DetailCard';
import { FailedContactScreens } from './components/FailedContactScreens';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from './contactsDetailView.constants.ts';
import { isFailedContactData } from './contactsDetailView.helpers.ts';
import { useContactsDetailView } from './hooks/useContactsDetailView.ts';

export function ContactsDetailView() {
  const { contactData, isEditing, handleBack, handleRetry, handleEdit } = useContactsDetailView();

  if (isFailedContactData(contactData)) {
    return <FailedContactScreens status={contactData.status} onBack={handleBack} onRetry={handleRetry} />;
  }

  return (
    <section className="space-y-6">
      <BackToContactsLink onBack={handleBack} />

      <ContactHeader data={contactData} isEditing={isEditing} onEdit={handleEdit} />

      {contactData.status === DETAIL_VIEW_STATUS.READY && (
        // Details and tags on the left, activity on the right; stacked in that order when narrow.
        <div className="grid items-start gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {/* 3 · Details (view / edit form) */}
            <DetailCard
              title={DETAIL_VIEW_TEXT.SECTIONS.DETAILS}
              aside={isEditing ? DETAIL_VIEW_TEXT.SECTIONS.EDITING : undefined}
            />
            {/* 5 · Tags */}
            <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.TAGS} aside={DETAIL_VIEW_TEXT.SECTIONS.TAGS_AUTOSAVE} />
          </div>
          {/* 4 · Recent activity */}
          <div className="lg:col-span-2">
            <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.ACTIVITY} />
          </div>
        </div>
      )}
    </section>
  );
}
