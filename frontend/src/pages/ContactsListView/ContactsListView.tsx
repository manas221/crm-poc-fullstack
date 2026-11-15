import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SearchIcon } from '../../components/icons';
import { formatNumber } from '../../utils/format.ts';
import { ContactsTable } from './components/ContactsTable';
import { LIST_VIEW_TEXT } from './contactsListView.constants.ts';
import { SearchInput } from './components/SearchInput';
import { useContactsListView } from './hooks/useContactsListView.ts';

export function ContactsListView() {
  const { params, total, tableData, hasFilters, actions } = useContactsListView();

  const emptyState = hasFilters ? (
    <EmptyState
      icon={<SearchIcon className="size-8" />}
      title={LIST_VIEW_TEXT.NO_RESULTS.TITLE}
      description={LIST_VIEW_TEXT.NO_RESULTS.DESCRIPTION}
      action={<Button onClick={actions.clearFilters}>{LIST_VIEW_TEXT.NO_RESULTS.CLEAR_FILTERS}</Button>}
    />
  ) : (
    <EmptyState title={LIST_VIEW_TEXT.NO_CONTACTS.TITLE} description={LIST_VIEW_TEXT.NO_CONTACTS.DESCRIPTION} />
  );

  return (
    <section className="space-y-5">
      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-semibold text-gray-900">{LIST_VIEW_TEXT.TITLE}</h1>
        {total !== undefined && (
          <span className="text-base text-gray-500">{LIST_VIEW_TEXT.TOTAL_CONTACTS(formatNumber(total))}</span>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={params.q ?? ''} onSearch={actions.search} />
      </div>

      {tableData.status === 'error' && (
        <Alert
          variant="error"
          action={
            <Button variant="danger-outline" onClick={actions.retry}>
              {LIST_VIEW_TEXT.LOAD_ERROR.RETRY}
            </Button>
          }
        >
          {LIST_VIEW_TEXT.LOAD_ERROR.MESSAGE}
        </Alert>
      )}

      <ContactsTable data={tableData} emptyState={emptyState} />
    </section>
  );
}
