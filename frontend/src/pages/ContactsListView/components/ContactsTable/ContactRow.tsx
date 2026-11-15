import { Link } from 'react-router';
import type { Contact } from '../../../../types/api.ts';
import { formatDate } from '../../../../utils/format.ts';
import { EmptyValue } from './EmptyValue.tsx';
import { TagCell } from './TagCell.tsx';

const CELL = 'px-4 py-3';

/** A text cell that truncates with "…" and shows the full value on hover. */
function TextCell({ value }: { value: string | null }) {
  return (
    <td className={`${CELL} truncate text-gray-700`} title={value ?? undefined}>
      {value ?? <EmptyValue />}
    </td>
  );
}

export function ContactRow({ contact }: { contact: Contact }) {
  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <tr className="hover:bg-gray-50">
      <td className={`${CELL} truncate`}>
        <Link to={`/contacts/${contact.id}`} title={fullName} className="font-medium text-blue-600 hover:underline">
          {fullName}
        </Link>
      </td>
      <TextCell value={contact.email} />
      <TextCell value={contact.phone} />
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
