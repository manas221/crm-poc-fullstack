import { Skeleton } from '../../../../components/Skeleton';
import { CONTACT_TABLE_COLUMN_KEYS } from '../../contactsListView.constants.ts';
import { COLUMNS } from './columns.ts';

// Varying bar widths (fixed per row, not random) so the skeleton looks like real text.
const WIDTHS = ['w-3/5', 'w-4/5', 'w-1/2', 'w-2/3', 'w-3/4'];

export function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, row) => (
        <tr key={row} aria-hidden="true">
          {COLUMNS.map((column, col) => (
            <td key={column.key} className="px-4 py-4">
              {column.key === CONTACT_TABLE_COLUMN_KEYS.CHECKBOX ? (
                <Skeleton className="size-4" /> // a grey square where the checkbox goes
              ) : (
                <Skeleton className={WIDTHS[(row + col) % WIDTHS.length]} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
