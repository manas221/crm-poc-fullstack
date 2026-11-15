import { useContactsQuery, useContactsTotalQuery, useTagsQuery } from '../../../queries/contacts-queries.ts';
import type { ContactSort } from '../../../types/api.ts';
import type { ContactsTableData } from '../components/ContactsTable';
import type { PaginationFooterData } from '../components/PaginationFooter';
import type { TagOptionsData } from '../components/TagsFilter';
import { LIST_VIEW_ACTION_TYPES, LIST_VIEW_STATUS } from '../contactsListView.constants.ts';
import { getPageCount, hasActiveFilters } from '../contactsListView.helpers.ts';
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
  const tagsQuery = useTagsQuery();

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

  return {
    params,
    total: totalQuery.data,
    tableData,
    footerData,
    tagOptions,
    tagIds,
    selectedTags,
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
  };
}
