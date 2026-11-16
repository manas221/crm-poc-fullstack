import { Button } from '../../../../components/Button';
import { PencilIcon } from '../../../../components/icons';
import type { Contact } from '../../../../types/api.ts';
import { DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { ContactFormState } from '../../contactsDetailView.types.ts';
import { DetailCard } from '../DetailCard';
import { ContactDetailsView } from './ContactDetailsView.tsx';
import { ContactEditForm } from './ContactEditForm.tsx';

interface ContactDetailsProps {
  contact: Contact;
  contactFormState: ContactFormState;
}

/** The "Details" card: the contact's fields with an Edit button, or the edit form while editing. */
export function ContactDetails({ contact, contactFormState }: ContactDetailsProps) {
  if (contactFormState.isEditing) {
    return <ContactEditForm contact={contact} form={contactFormState} />;
  }
  return (
    <DetailCard
      title={DETAIL_VIEW_TEXT.SECTIONS.DETAILS}
      aside={
        // -my-2: the button mustn't make this header taller than the "Editing" one.
        <Button className="-my-2" onClick={contactFormState.handleStartEdit}>
          <PencilIcon className="size-4" />
          {DETAIL_VIEW_TEXT.DETAILS.EDIT}
        </Button>
      }
    >
      <ContactDetailsView contact={contact} />
    </DetailCard>
  );
}
