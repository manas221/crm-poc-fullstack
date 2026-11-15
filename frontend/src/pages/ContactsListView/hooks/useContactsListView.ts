import { useState } from 'react';
import {
  useBulkAssignTagMutation,
  useContactsQuery,
  useContactsTotalQuery,
  useTagsQuery,
} from '../../../queries/contacts-queries.ts';
import type { ContactSort } from '../../../types/api.ts';
import type { ContactsTableData } from '../components/ContactsTable';
import type { PaginationFooterData } from '../components/PaginationFooter';
import type { TagOptionsData } from '../components/TagsFilter';
import {
  BULK_ASSIGN_STATUS,
  LIST_VIEW_ACTION_TYPES,
  LIST_VIEW_STATUS,
  LIST_VIEW_TEXT,
  ROW_SELECTION_ACTION_TYPES,
} from '../contactsListView.constants.ts';
import {
  getBulkAssignError,
  getBulkAssignSuccessMessage,
  getPageCount,
  hasActiveFilters,
  toSearchParams,
} from '../contactsListView.helpers.ts';
import type { BulkAssignData } from '../contactsListView.types.ts';
import { useListParams } from './useListParams.ts';
import { useRowSelection } from './useRowSelection.ts';

/**
 * Everything the list page needs, in one place: URL params, the queries built from them,
 * derived view state and the action handlers. Derived values are computed here on every
 * render, never stored, so they can't drift from the data they come from.
 */
export function useContactsListView() {
  const { params, onAction } = useListParams();
  const contactsQuery = useContactsQuery(params);
  const totalQuery = useContactsTotalQuery();
  const tagsQuery = useTagsQuery();
  // Identifies the exact list on screen (search, filters, sort, page and size). A selection,
  // and the result of assigning a tag to it, belong to one list: change any of them and they go.
  const scopeKey = toSearchParams(params).toString();
  const selection = useRowSelection(scopeKey);
  const bulkAssign = useBulkAssignTagMutation();
  // The list the last "Assign tag" was made in. Its result only shows while that list is on
  // screen (derived below, like the selection, rather than cleared by an effect).
  const [assignScopeKey, setAssignScopeKey] = useState<string | null>(null);

  const { data, isError, isFetching, isPlaceholderData } = contactsQuery;

  let tableData: ContactsTableData;
  let footerData: PaginationFooterData;
  if (data) {
    tableData =
      data.data.length > 0
        ? { status: LIST_VIEW_STATUS.READY, contacts: data.data, isUpdating: isPlaceholderData }
        : { status: LIST_VIEW_STATUS.EMPTY };
    // Page count from the total and the *requested* limit: while a new page size loads, the
    // previous response (kept as placeholder) still carries the old size's totalPages.
    footerData = {
      status: LIST_VIEW_STATUS.READY,
      total: data.pagination.total,
      pageCount: getPageCount(data.pagination.total, params.limit),
    };
  } else if (isError && !isFetching) {
    tableData = { status: LIST_VIEW_STATUS.ERROR };
    footerData = { status: LIST_VIEW_STATUS.ERROR };
  } else {
    // First load, a new search/filter/sort (no placeholder rows), or retrying after an error.
    tableData = { status: LIST_VIEW_STATUS.LOADING, rowCount: params.limit };
    footerData = { status: LIST_VIEW_STATUS.LOADING };
  }

  let tagOptions: TagOptionsData;
  if (tagsQuery.data) {
    tagOptions = { status: LIST_VIEW_STATUS.READY, tags: tagsQuery.data };
  } else if (tagsQuery.isError && !tagsQuery.isFetching) {
    tagOptions = { status: LIST_VIEW_STATUS.ERROR };
  } else {
    tagOptions = { status: LIST_VIEW_STATUS.LOADING };
  }
  const tagIds = params.tags ?? [];
  // For the chips. Ids of tags that no longer exist get no chip; "Clear filters" still removes them.
  const selectedTags = tagsQuery.data?.filter((tag) => tagIds.includes(tag.id)) ?? [];

  // Only rows on screen count: after a refetch, a checked contact may have left this page.
  const visibleIds = tableData.status === LIST_VIEW_STATUS.READY ? tableData.contacts.map((c) => c.id) : [];
  const selectedIds: ReadonlySet<number> = new Set(visibleIds.filter((id) => selection.selectedIds.has(id)));

  let bulkAssignData: BulkAssignData;
  if (bulkAssign.isIdle || assignScopeKey !== scopeKey) {
    bulkAssignData = { status: BULK_ASSIGN_STATUS.IDLE };
  } else if (bulkAssign.isPending) {
    bulkAssignData = { status: BULK_ASSIGN_STATUS.PENDING };
  } else if (bulkAssign.isSuccess) {
    const tagName =
      tagsQuery.data?.find((tag) => tag.id === bulkAssign.data.tagId)?.name ?? LIST_VIEW_TEXT.ASSIGN_TAG.FALLBACK_TAG_NAME;
    bulkAssignData = { status: BULK_ASSIGN_STATUS.SUCCESS, message: getBulkAssignSuccessMessage(bulkAssign.data, tagName) };
  } else {
    bulkAssignData = { status: BULK_ASSIGN_STATUS.ERROR, ...getBulkAssignError(bulkAssign.error) };
  }
  const isAssigning = bulkAssignData.status === BULK_ASSIGN_STATUS.PENDING;

  // An old or hand-edited link (?page=9999): the list has rows, just not on this page.
  const isPastLastPage =
    footerData.status === LIST_VIEW_STATUS.READY && footerData.total > 0 && params.page > footerData.pageCount;

  const handleSearch = (q: string) => onAction({ type: LIST_VIEW_ACTION_TYPES.SEARCH, q });
  const handleSort = (sort: ContactSort) => onAction({ type: LIST_VIEW_ACTION_TYPES.SORT, sort });
  const handleClearFilters = () => onAction({ type: LIST_VIEW_ACTION_TYPES.CLEAR_FILTERS });
  const handleCompanyChange = (company: string | undefined) =>
    onAction({ type: LIST_VIEW_ACTION_TYPES.COMPANY, company });
  const handleRemoveCompany = () => handleCompanyChange(undefined);
  const handleTagsChange = (tags: number[]) => onAction({ type: LIST_VIEW_ACTION_TYPES.TAGS, tags });
  const handleRemoveTag = (tagId: number) => handleTagsChange(tagIds.filter((id) => id !== tagId));
  const handleRetryTags = () => void tagsQuery.refetch();
  const handlePageChange = (page: number) => onAction({ type: LIST_VIEW_ACTION_TYPES.PAGE, page });
  const handleLimitChange = (limit: number) => onAction({ type: LIST_VIEW_ACTION_TYPES.LIMIT, limit });
  const handleGoToLastPage = () => {
    if (footerData.status === LIST_VIEW_STATUS.READY) {
      handlePageChange(footerData.pageCount);
    }
  };
  const handleRetry = () => void contactsQuery.refetch();
  // A changed selection makes the last result ("Added VIP to 3 contacts") out of date. While a
  // request runs the selection can't change (the checkboxes are disabled).
  const resetAssignResult = () => {
    if (!bulkAssign.isPending) {
      bulkAssign.reset();
    }
  };
  const handleToggleRow = (id: number) => {
    resetAssignResult();
    selection.onSelectionAction({ type: ROW_SELECTION_ACTION_TYPES.TOGGLE, id });
  };
  const handleClearSelection = () => {
    resetAssignResult();
    selection.onSelectionAction({ type: ROW_SELECTION_ACTION_TYPES.CLEAR });
  };
  const handleToggleAllRows = () => {
    if (visibleIds.length > 0 && selectedIds.size === visibleIds.length) {
      handleClearSelection();
    } else {
      resetAssignResult();
      selection.onSelectionAction({ type: ROW_SELECTION_ACTION_TYPES.SELECT_MANY, ids: visibleIds });
    }
  };
  // The selection stays after a success, so another tag can be added to the same contacts.
  // On success the mutation refreshes the list, so the rows show the new tag.
  const handleAssignTag = (tagId: number) => {
    const contactIds = [...selectedIds];
    if (contactIds.length === 0 || bulkAssign.isPending) {
      return;
    }
    setAssignScopeKey(scopeKey);
    bulkAssign.mutate({ contactIds, tagId });
  };
  // Same tag, current selection: after a "contacts not found" the refreshed list has already
  // dropped the missing rows from it.
  const handleRetryAssign = () => {
    if (bulkAssign.variables) {
      handleAssignTag(bulkAssign.variables.tagId);
    }
  };

  return {
    params,
    total: totalQuery.data,
    tableData,
    footerData,
    tagOptions,
    tagIds,
    selectedTags,
    selectedIds,
    bulkAssignData,
    isAssigning,
    hasFilters: hasActiveFilters(params),
    isPastLastPage,
    handleSearch,
    handleSort,
    handleClearFilters,
    handleCompanyChange,
    handleRemoveCompany,
    handleTagsChange,
    handleRemoveTag,
    handleRetryTags,
    handlePageChange,
    handleLimitChange,
    handleGoToLastPage,
    handleRetry,
    handleToggleRow,
    handleToggleAllRows,
    handleClearSelection,
    handleAssignTag,
    handleRetryAssign,
  };
}
