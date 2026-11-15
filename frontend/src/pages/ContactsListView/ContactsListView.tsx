import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SearchIcon } from '../../components/icons';
import { formatNumber } from '../../utils/format.ts';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { ContactsTable } from './components/ContactsTable';
import { FiltersBar } from './components/FiltersBar';
import { PaginationFooter } from './components/PaginationFooter';
import { LIST_VIEW_STATUS, LIST_VIEW_TEXT } from './contactsListView.constants.ts';
import { useContactsListView } from './hooks/useContactsListView.ts';

export function ContactsListView() {
  const {
    params,
    total,
    tableData,
    footerData,
    tagOptions,
    tagIds,
    selectedTags,
    hasFilters,
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
  } = useContactsListView();

  const emptyState = isPastLastPage ? (
    <EmptyState
      title={LIST_VIEW_TEXT.PAST_LAST_PAGE.TITLE}
      description={LIST_VIEW_TEXT.PAST_LAST_PAGE.DESCRIPTION(
        formatNumber(footerData.status === LIST_VIEW_STATUS.READY ? footerData.pageCount : 0),
      )}
      action={<Button onClick={handleGoToLastPage}>{LIST_VIEW_TEXT.PAST_LAST_PAGE.GO_TO_LAST_PAGE}</Button>}
    />
  ) : hasFilters ? (
    <EmptyState
      icon={<SearchIcon className="size-8" />}
      title={LIST_VIEW_TEXT.NO_RESULTS.TITLE}
      description={LIST_VIEW_TEXT.NO_RESULTS.DESCRIPTION}
      action={<Button onClick={handleClearFilters}>{LIST_VIEW_TEXT.NO_RESULTS.CLEAR_FILTERS}</Button>}
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

      <FiltersBar
        q={params.q}
        company={params.company}
        tagIds={tagIds}
        tagOptions={tagOptions}
        hasFilters={hasFilters}
        onSearch={handleSearch}
        onCompanyChange={handleCompanyChange}
        onTagsChange={handleTagsChange}
        onRetryTags={handleRetryTags}
        onClearFilters={handleClearFilters}
      />

      <ActiveFilterChips
        company={params.company}
        tags={selectedTags}
        onRemoveCompany={handleRemoveCompany}
        onRemoveTag={handleRemoveTag}
      />

      {tableData.status === LIST_VIEW_STATUS.ERROR && (
        <Alert
          variant="error"
          action={
            <Button variant="danger-outline" onClick={handleRetry}>
              {LIST_VIEW_TEXT.LOAD_ERROR.RETRY}
            </Button>
          }
        >
          {LIST_VIEW_TEXT.LOAD_ERROR.MESSAGE}
        </Alert>
      )}

      <ContactsTable
        data={tableData}
        emptyState={emptyState}
        sort={params.sort}
        order={params.order}
        onSort={handleSort}
      />

      <PaginationFooter
        data={footerData}
        page={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </section>
  );
}
