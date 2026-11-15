import { useContactsTotalQuery } from '../../queries/contacts-queries.ts';
import { formatNumber } from '../../utils/format.ts';

export function ContactsListView() {
  const total = useContactsTotalQuery();

  return (
    <section>
      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-semibold text-gray-900">Contacts</h1>
        {total.data !== undefined && (
          <span className="text-base text-gray-500">{formatNumber(total.data)} contacts</span>
        )}
      </header>
    </section>
  );
}
