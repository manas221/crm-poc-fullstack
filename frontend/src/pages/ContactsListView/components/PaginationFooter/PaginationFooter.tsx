import { Button } from '../../../../components/Button';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../../components/icons';
import { Skeleton } from '../../../../components/Skeleton';
import { formatNumber } from '../../../../utils/format.ts';
import { LIST_VIEW_STATUS, LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { RowsPerPageSelect } from './RowsPerPageSelect.tsx';

/** What the footer knows about the result set. Built by useContactsListView from the query state. */
export type PaginationFooterData =
  | { status: typeof LIST_VIEW_STATUS.LOADING }
  | { status: typeof LIST_VIEW_STATUS.ERROR }
  | { status: typeof LIST_VIEW_STATUS.READY; total: number; pageCount: number };

interface PaginationFooterProps {
  data: PaginationFooterData;
  /** The requested page and size, from the URL, so they update the moment you click. */
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const TEXT = LIST_VIEW_TEXT.PAGINATION;

/** "Showing 26–50 of 50,000"; "Showing 0 of N" for an empty list or a page past the end. */
function getShowingText(page: number, limit: number, total: number): string {
  const start = (page - 1) * limit + 1;
  if (start > total) {
    return TEXT.SHOWING_NONE(formatNumber(total));
  }
  const end = Math.min(page * limit, total);
  return TEXT.SHOWING(formatNumber(start), formatNumber(end), formatNumber(total));
}

export function PaginationFooter({ data, page, limit, onPageChange, onLimitChange }: PaginationFooterProps) {
  const isReady = data.status === LIST_VIEW_STATUS.READY;
  const canGoBack = isReady && page > 1;
  const canGoForward = isReady && page < data.pageCount;
  // Past the end (an old link): step back onto the last real page, not to page - 1.
  const previousPage = isReady ? Math.min(page - 1, data.pageCount) : page - 1;
  // First / Last are left out when you're already there. Until the page count is known
  // (loading, error) Last stays, disabled, so the footer doesn't jump when the data arrives.
  // Past the end it shows too: it's the way back.
  const showFirst = page > 1;
  const showLast = !isReady || page !== data.pageCount;

  return (
    <nav aria-label={TEXT.NAV_LABEL} className="flex flex-wrap items-center justify-between gap-4">
      <RowsPerPageSelect value={limit} onChange={onLimitChange} />

      <div className="flex items-center gap-3 text-sm text-gray-600">
        {/* aria-live: screen readers hear the new range after Previous / Next. */}
        <span aria-live="polite">
          {data.status === LIST_VIEW_STATUS.LOADING && <Skeleton className="h-3.5 w-36" />}
          {data.status === LIST_VIEW_STATUS.ERROR && TEXT.SHOWING_UNKNOWN}
          {isReady && getShowingText(page, limit, data.total)}
        </span>

        {showFirst && (
          <Button disabled={!isReady} aria-label={TEXT.FIRST_ARIA_LABEL} onClick={() => onPageChange(1)}>
            <ChevronDoubleLeftIcon className="size-4" />
            {TEXT.FIRST}
          </Button>
        )}

        <Button disabled={!canGoBack} aria-label={TEXT.PREVIOUS_ARIA_LABEL} onClick={() => onPageChange(previousPage)}>
          <ChevronLeftIcon className="size-4" />
          {TEXT.PREVIOUS}
        </Button>

        <span>
          {data.status === LIST_VIEW_STATUS.LOADING && <Skeleton className="h-3.5 w-24" />}
          {data.status === LIST_VIEW_STATUS.ERROR && TEXT.PAGE_UNKNOWN}
          {isReady && TEXT.PAGE_OF(formatNumber(page), formatNumber(data.pageCount))}
        </span>

        <Button disabled={!canGoForward} aria-label={TEXT.NEXT_ARIA_LABEL} onClick={() => onPageChange(page + 1)}>
          {TEXT.NEXT}
          <ChevronRightIcon className="size-4" />
        </Button>

        {showLast && (
          <Button
            disabled={!isReady}
            aria-label={TEXT.LAST_ARIA_LABEL}
            onClick={() => isReady && onPageChange(data.pageCount)}
          >
            {TEXT.LAST}
            <ChevronDoubleRightIcon className="size-4" />
          </Button>
        )}
      </div>
    </nav>
  );
}
