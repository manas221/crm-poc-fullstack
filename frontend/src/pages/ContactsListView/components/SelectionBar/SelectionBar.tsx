import { Button } from '../../../../components/Button';
import { AlertCircleIcon, CheckIcon } from '../../../../components/icons';
import { formatNumber } from '../../../../utils/format.ts';
import { BULK_ASSIGN_STATUS, LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import type { BulkAssignData } from '../../contactsListView.types.ts';
import type { TagOptionsData } from '../TagsFilter';
import { AssignTagMenu } from './AssignTagMenu.tsx';

interface SelectionBarProps {
  selectedCount: number;
  tagOptions: TagOptionsData;
  bulkAssign: BulkAssignData;
  onAssignTag: (tagId: number) => void;
  onRetryAssign: () => void;
  onClearSelection: () => void;
}

/**
 * Shown while rows are checked: how many, the bulk "Assign tag" action and its result, and a
 * way out. The selection stays after a success, so another tag can go to the same contacts.
 */
export function SelectionBar({
  selectedCount,
  tagOptions,
  bulkAssign,
  onAssignTag,
  onRetryAssign,
  onClearSelection,
}: SelectionBarProps) {
  const isAssigning = bulkAssign.status === BULK_ASSIGN_STATUS.PENDING;

  return (
    <div
      role="region"
      aria-label={LIST_VIEW_TEXT.SELECTION.SELECTED_COUNT(formatNumber(selectedCount))}
      className="flex flex-wrap items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5"
    >
      <span className="border-r border-blue-200 pr-4 text-sm font-semibold text-gray-900" aria-live="polite">
        {LIST_VIEW_TEXT.SELECTION.SELECTED_COUNT(formatNumber(selectedCount))}
      </span>
      <AssignTagMenu
        selectedCount={selectedCount}
        options={tagOptions}
        onAssign={onAssignTag}
        isAssigning={isAssigning}
      />
      <Button variant="link" onClick={onClearSelection} disabled={isAssigning}>
        {LIST_VIEW_TEXT.SELECTION.CLEAR_SELECTION}
      </Button>

      {bulkAssign.status === BULK_ASSIGN_STATUS.SUCCESS && (
        <p role="status" className="flex items-center gap-1.5 text-sm text-green-700 sm:ml-auto">
          <CheckIcon className="size-4 shrink-0" />
          {bulkAssign.message}
        </p>
      )}
      {bulkAssign.status === BULK_ASSIGN_STATUS.ERROR && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-700 sm:ml-auto">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{bulkAssign.message}</span>
          {bulkAssign.canRetry && (
            <Button variant="link" onClick={onRetryAssign}>
              {LIST_VIEW_TEXT.ASSIGN_TAG.RETRY}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
