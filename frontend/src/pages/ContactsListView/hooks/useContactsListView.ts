import { useContactsQuery, useContactsTotalQuery } from '../../../queries/contacts-queries.ts';
import type { ContactSort } from '../../../types/api.ts';
import type { ContactsTableData } from '../components/ContactsTable';
import { LIST_VIEW_ACTION_TYPES } from '../contactsListView.constants.ts';
import { hasActiveFilters } from '../contactsListView.helpers.ts';
import { useListParams } from './useListParams.ts';

/**
 * Everything the list page needs, in one place: URL params, the queries built from them,
 * derived view state and the action handlers. Derived values are computed here on every
 * render, never stored, so they can't drift from the data they come from.
 */
export function useContactsListView() {
  const { params, onAction } = useListParams();
  const contactsQuery = useContactsQuery(params);
  const totalQuery = useContactsTotalQuery();

  const { data, isError, isFetching, isPlaceholderData } = contactsQuery;

  let tableData: ContactsTableData;
  if (data) {
    tableData =
      data.data.length > 0
        ? { status: 'ready', contacts: data.data, isUpdating: isPlaceholderData }
        : { status: 'empty' };
  } else if (isError && !isFetching) {
    tableData = { status: 'error' };
  } else {
    // First load, a new search/filter/sort (no placeholder rows), or retrying after an error.
    tableData = { status: 'loading', rowCount: params.limit };
  }

  const handleSearch = (q: string) => onAction({ type: LIST_VIEW_ACTION_TYPES.SEARCH, q });
  const handleSort = (sort: ContactSort) => onAction({ type: LIST_VIEW_ACTION_TYPES.SORT, sort });
  const handleClearFilters = () => onAction({ type: LIST_VIEW_ACTION_TYPES.CLEAR_FILTERS });
  const handleRetry = () => void contactsQuery.refetch();

  return {
    params,
    total: totalQuery.data,
    tableData,
    hasFilters: hasActiveFilters(params),
    handleSearch,
    handleSort,
    handleClearFilters,
    handleRetry,
  };
}
