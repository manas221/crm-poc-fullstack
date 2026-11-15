import { Menu, MenuButton, MenuHeading, MenuItem, MenuItems, MenuSection } from '@headlessui/react';
import { cn } from '../../../../utils/cn.ts';
import { getTagColor } from '../../../../utils/tagColors.ts';
import { LIST_VIEW_STATUS, LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { FilterButton } from '../FilterButton';
import type { TagOptionsData } from '../TagsFilter';

interface AssignTagMenuProps {
  selectedCount: number;
  options: TagOptionsData;
  onAssign: (tagId: number) => void;
  /** A request is running: the button says so and can't be opened. */
  isAssigning: boolean;
}

const TEXT = LIST_VIEW_TEXT.ASSIGN_TAG;

/** "Assign tag" dropdown: picking a tag adds it to every selected contact. */
export function AssignTagMenu({ selectedCount, options, onAssign, isAssigning }: AssignTagMenuProps) {
  return (
    <Menu>
      <MenuButton
        as={FilterButton}
        label={isAssigning ? TEXT.ASSIGNING : TEXT.LABEL}
        disabled={isAssigning}
        className="py-1.5 disabled:cursor-wait disabled:opacity-60"
      />
      <MenuItems
        anchor="bottom start"
        className="z-20 w-60 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg [--anchor-gap:8px] focus:outline-none"
      >
        <MenuSection>
          <MenuHeading className="px-3 pt-1.5 pb-1 text-xs text-gray-500">{TEXT.MENU_TITLE(selectedCount)}</MenuHeading>
          {options.status === LIST_VIEW_STATUS.READY &&
            options.tags.map((tag) => (
              <MenuItem key={tag.id}>
                <button
                  type="button"
                  onClick={() => onAssign(tag.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-gray-900 data-focus:bg-gray-100"
                >
                  <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', getTagColor(tag.name).dot)} />
                  <span className="truncate">{tag.name}</span>
                </button>
              </MenuItem>
            ))}
        </MenuSection>

        {options.status === LIST_VIEW_STATUS.READY && options.tags.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500">{TEXT.NO_TAGS}</p>
        )}
        {options.status === LIST_VIEW_STATUS.LOADING && <p className="px-3 py-2 text-sm text-gray-500">{TEXT.LOADING}</p>}
        {/* The tags filter's dropdown has the Retry for the same query. */}
        {options.status === LIST_VIEW_STATUS.ERROR && <p className="px-3 py-2 text-sm text-red-700">{TEXT.ERROR}</p>}
      </MenuItems>
    </Menu>
  );
}
