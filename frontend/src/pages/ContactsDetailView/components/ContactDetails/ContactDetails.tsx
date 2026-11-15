import { useState } from 'react';
import { Button } from '../../../../components/Button';
import { PencilIcon } from '../../../../components/icons';
import type { Contact } from '../../../../types/api.ts';
import { DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import { DetailCard } from '../DetailCard';
import { ContactDetailsView } from './ContactDetailsView.tsx';
import { ContactEditForm } from './ContactEditForm.tsx';

/**
 * The "Details" card: the contact's fields with an Edit button, or the edit form while
 * editing. Edit mode is local to this card: nothing else on the page depends on it. The page
 * keys this component by contact id, so opening another contact starts in view mode.
 */
export function ContactDetails({ contact }: { contact: Contact }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    // Mounted fresh each time editing starts, so the form starts from the contact as it is now.
    return <ContactEditForm contact={contact} onExitEdit={() => setIsEditing(false)} />;
  }
  return (
    <DetailCard
      title={DETAIL_VIEW_TEXT.SECTIONS.DETAILS}
      aside={
        // -my-2: the button mustn't make this header taller than the "Editing" one.
        <Button className="-my-2" onClick={() => setIsEditing(true)}>
          <PencilIcon className="size-4" />
          {DETAIL_VIEW_TEXT.DETAILS.EDIT}
        </Button>
      }
    >
      <ContactDetailsView contact={contact} />
    </DetailCard>
  );
}
