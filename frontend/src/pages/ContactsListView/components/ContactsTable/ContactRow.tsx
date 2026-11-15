import { Link } from 'react-router';
import { Checkbox } from '../../../../components/Checkbox';
import { CopyButton } from '../../../../components/CopyButton';
import type { Contact } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import { formatDate } from '../../../../utils/format.ts';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { EmptyValue } from './EmptyValue.tsx';
import { TagCell } from './TagCell.tsx';

const CELL = 'px-4 py-3';

// Hidden until the cell is hovered. Also shown when focused by keyboard, while it shows the
// copied / failed result (the pointer may have left already), and on touch screens (no hover).
const COPY_BUTTON_VISIBILITY = [
  '-my-1 opacity-0',
  'group-hover/cell:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100',
  'data-[status=copied]:opacity-100 data-[status=failed]:opacity-100',
].join(' ');

/** A text cell that truncates with "…" and shows the full value on hover. */
function TextCell({ value }: { value: string | null }) {
  return (
    <td className={`${CELL} truncate text-gray-700`} title={value ?? undefined}>
      {value ?? <EmptyValue />}
    </td>
  );
}

/**
 * A TextCell with a copy button after the value (none for an empty value). The button shows
 * on hovering the cell; it keeps its space while hidden, so the text doesn't shift.
 */
function CopyableTextCell({ value, copyLabel }: { value: string | null; copyLabel: (value: string) => string }) {
  if (value === null) {
    return <TextCell value={null} />;
  }
  return (
    <td className={`${CELL} group/cell text-gray-700`}>
      <div className="flex min-w-0 items-center gap-1">
        <span className="truncate" title={value}>
          {value}
        </span>
        {/* -my-1: the button's padding (a bigger click target) mustn't make the row taller. */}
        <CopyButton text={value} label={copyLabel(value)} className={COPY_BUTTON_VISIBILITY} />
      </div>
    </td>
  );
}

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  /** While the next page loads, these rows are the old page's: don't let them be picked. */
  isSelectionDisabled: boolean;
  onToggleSelected: () => void;
}

export function ContactRow({ contact, isSelected, isSelectionDisabled, onToggleSelected }: ContactRowProps) {
  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <tr className={cn(isSelected ? 'bg-blue-50' : 'hover:bg-gray-50')}>
      <td className={CELL}>
        <Checkbox
          checked={isSelected}
          disabled={isSelectionDisabled}
          onChange={onToggleSelected}
          aria-label={LIST_VIEW_TEXT.SELECTION.SELECT_ROW_ARIA_LABEL(fullName)}
        />
      </td>
      <td className={`${CELL} truncate`}>
        <Link to={`/contacts/${contact.id}`} title={fullName} className="font-medium text-blue-600 hover:underline">
          {fullName}
        </Link>
      </td>
      <CopyableTextCell value={contact.email} copyLabel={LIST_VIEW_TEXT.TABLE.COPY_EMAIL} />
      <CopyableTextCell value={contact.phone} copyLabel={LIST_VIEW_TEXT.TABLE.COPY_PHONE} />
      <TextCell value={contact.company} />
      <td className={CELL}>
        <TagCell tags={contact.tags} />
      </td>
      <td className={`${CELL} whitespace-nowrap text-gray-700`}>
        <time dateTime={contact.createdAt}>{formatDate(contact.createdAt)}</time>
      </td>
    </tr>
  );
}
