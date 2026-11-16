import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '../../../../components/icons';
import { DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';

interface BackToContactsLinkProps {
  onBack: () => void;
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function BackToContactsLink({ onBack }: BackToContactsLinkProps) {
  const handleClick = (event: MouseEvent) => {
    // Only hijack plain clicks; Cmd/Ctrl/middle-click fall through to the href and open "/" in a new tab.
    if (isPlainClick(event)) {
      event.preventDefault();
      onBack();
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <ArrowLeftIcon className="size-4" />
      {DETAIL_VIEW_TEXT.BACK_TO_CONTACTS}
    </Link>
  );
}
