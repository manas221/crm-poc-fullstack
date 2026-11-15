import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Button } from '../../../../components/Button';
import { CheckIcon } from '../../../../components/icons';
import type { Tag } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import { getTagColor } from '../../../../utils/tagColors.ts';
import { LIST_VIEW_STATUS, LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { FilterButton } from '../FilterButton';

/** The tags to pick from. Built by useContactsListView from the tags query. */
export type TagOptionsData =
  | { status: typeof LIST_VIEW_STATUS.LOADING }
  | { status: typeof LIST_VIEW_STATUS.ERROR }
  | { status: typeof LIST_VIEW_STATUS.READY; tags: Tag[] };

interface TagsFilterProps {
  options: TagOptionsData;
  /** Tag ids in the URL. */
  value: number[];
  /** Called with the whole new selection on every toggle; the list stays open. */
  onChange: (tagIds: number[]) => void;
  onRetry: () => void;
}

const TEXT = LIST_VIEW_TEXT.FILTERS.TAGS;

/** "VIP", "VIP +2", or just the count while the names are still loading. */
function getButtonValue(options: TagOptionsData, value: number[]): string | undefined {
  if (value.length === 0) {
    return undefined;
  }
  const names =
    options.status === LIST_VIEW_STATUS.READY
      ? options.tags.filter((tag) => value.includes(tag.id)).map((tag) => tag.name)
      : [];
  const [first, ...rest] = names;
  if (first === undefined) {
    return String(value.length); // names not loaded yet, or ids of tags that no longer exist
  }
  return rest.length === 0 ? first : TEXT.MORE(first, rest.length);
}

export function TagsFilter({ options, value, onChange, onRetry }: TagsFilterProps) {
  return (
    <Listbox value={value} onChange={onChange} multiple>
      <ListboxButton as={FilterButton} label={TEXT.LABEL} value={getButtonValue(options, value)} />
      <ListboxOptions
        anchor="bottom start"
        className="z-20 w-60 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg [--anchor-gap:8px] focus:outline-none"
      >
        {options.status === LIST_VIEW_STATUS.READY &&
          options.tags.map((tag) => (
            <ListboxOption
              key={tag.id}
              value={tag.id}
              className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-900 data-focus:bg-gray-100"
            >
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center rounded border border-gray-300 bg-white group-data-selected:border-blue-600 group-data-selected:bg-blue-600"
              >
                <CheckIcon className="hidden size-3 text-white group-data-selected:block" strokeWidth={3} />
              </span>
              <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', getTagColor(tag.name).dot)} />
              <span className="truncate">{tag.name}</span>
            </ListboxOption>
          ))}

        {options.status === LIST_VIEW_STATUS.READY && options.tags.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500">{TEXT.NO_TAGS}</p>
        )}
        {options.status === LIST_VIEW_STATUS.LOADING && (
          <p className="px-3 py-2 text-sm text-gray-500">{TEXT.LOADING}</p>
        )}
        {options.status === LIST_VIEW_STATUS.ERROR && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-red-700">
            {TEXT.ERROR}
            <Button variant="link" onClick={onRetry}>
              {TEXT.RETRY}
            </Button>
          </div>
        )}
      </ListboxOptions>
    </Listbox>
  );
}
