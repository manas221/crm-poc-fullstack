import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '../../../../components/icons';
import { DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';

interface BackToContactsLinkProps {
  /** Goes back to the list (see useBackToContacts). */
  onBack: () => void;
}

/** A plain left click (not a middle click or Cmd/Ctrl/Shift-click, which open a tab or window). */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * A real link to "/", so opening it in a new tab still works; a plain click is handled by
 * onBack instead, which goes back in history when we came from the list.
 */
export function BackToContactsLink({ onBack }: BackToContactsLinkProps) {
  return (
    <Link
      to="/"
      onClick={(event) => {
        if (isPlainClick(event)) {
          event.preventDefault();
          onBack();
        }
      }}
      className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <ArrowLeftIcon className="size-4" />
      {DETAIL_VIEW_TEXT.BACK_TO_CONTACTS}
    </Link>
  );
}
