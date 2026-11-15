import { cn } from '../../../../../utils/cn.ts';
import type { ContactCellProps } from '../../../contactsListView.types.ts';
import { COLUMNS } from '../columns.ts';

/** One row: each column's Cell, in COLUMNS order, so the cells always line up with the header. */
export function ContactRow(props: ContactCellProps) {
  return (
    <tr className={cn(props.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50')}>
      {COLUMNS.map(({ key, Cell }) => (
        <Cell key={key} {...props} />
      ))}
    </tr>
  );
}
