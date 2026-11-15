import { BackToContactsLink } from './components/BackToContactsLink';
import { ContactActivity } from './components/ContactActivity';
import { ContactDetails } from './components/ContactDetails';
import { ContactHeader } from './components/ContactHeader';
import { ContactTags } from './components/ContactTags';
import { FailedContactScreens } from './components/FailedContactScreens';
import { DETAIL_VIEW_STATUS } from './contactsDetailView.constants.ts';
import { isFailedContactData } from './contactsDetailView.helpers.ts';
import { useContactsDetailView } from './hooks/useContactsDetailView.ts';

export function ContactsDetailView() {
  const { contactData, handleBack, handleRetry } = useContactsDetailView();

  if (isFailedContactData(contactData)) {
    return <FailedContactScreens status={contactData.status} onBack={handleBack} onRetry={handleRetry} />;
  }

  return (
    <section className="space-y-6">
      <BackToContactsLink onBack={handleBack} />

      <ContactHeader data={contactData} />

      {contactData.status === DETAIL_VIEW_STATUS.READY && (
        // Details and tags on the left, activity on the right; stacked in that order when narrow.
        <div className="grid items-start gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {/* Keyed by id: another contact (same route, page stays mounted) starts in view mode. */}
            <ContactDetails key={contactData.contact.id} contact={contactData.contact} />
            <ContactTags contact={contactData.contact} />
          </div>
          <div className="lg:col-span-2">
            <ContactActivity contactId={contactData.contact.id} />
          </div>
        </div>
      )}
    </section>
  );
}
