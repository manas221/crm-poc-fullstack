import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { AlertCircleIcon, PlusIcon } from '../../../../components/icons';
import { Skeleton } from '../../../../components/Skeleton';
import type { Tag } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import { getTagColor } from '../../../../utils/tagColors.ts';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { TagPickerData } from '../../contactsDetailView.types.ts';

const TEXT = DETAIL_VIEW_TEXT.TAGS;
const SKELETON_WIDTHS = ['w-32', 'w-24', 'w-28', 'w-20'];
const ITEM = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm data-focus:bg-gray-100';

interface AddTagMenuProps {
  data: TagPickerData;
  onAdd: (tag: Tag) => void;
  /** Refetches the tags after they failed to load. */
  onRetry: () => void;
}

/**
 * "+ Add tag" and the tags the contact doesn't have yet. A menu (arrow keys, Enter, Escape),
 * no search: there are only a handful of tags. Picking one closes it (mockup T5).
 */
export function AddTagMenu({ data, onAdd, onRetry }: AddTagMenuProps) {
  return (
    <Menu>
      {/* data-focus (Headless UI's keyboard focus), not focus-visible: closing the menu hands
          focus back to this button, and the browser would ring it after a mouse pick too. */}
      <MenuButton className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-700 outline-none hover:border-gray-400 hover:text-gray-900 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-solid data-focus:outline-blue-600 data-open:border-solid data-open:border-blue-600 data-open:text-gray-900">
        <PlusIcon className="size-3.5" />
        {TEXT.ADD_TAG}
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        className="z-20 w-60 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg [--anchor-gap:8px] focus:outline-none"
      >
        {data.status === DETAIL_VIEW_STATUS.LOADING && (
          // T1
          <div aria-busy="true">
            {SKELETON_WIDTHS.map((width) => (
              <div key={width} className="flex items-center gap-3 px-3 py-2.5">
                {/* Not <Skeleton>: its fixed h-3 would win over size-2 (cn doesn't merge classes). */}
                <div aria-hidden="true" className="size-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <Skeleton className={width} />
              </div>
            ))}
            <p role="status" className="sr-only">
              {TEXT.LOADING}
            </p>
          </div>
        )}

        {data.status === DETAIL_VIEW_STATUS.ERROR && (
          // T8. Retry is a menu item so the keyboard can reach it; like any item, it closes the menu.
          <>
            <p role="alert" className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-sm text-red-700">
              <AlertCircleIcon className="size-4 shrink-0" />
              {TEXT.LOAD_ERROR}
            </p>
            <MenuItem>
              <button type="button" onClick={onRetry} className={cn(ITEM, 'font-medium text-blue-600')}>
                {TEXT.RETRY}
              </button>
            </MenuItem>
          </>
        )}

        {data.status === DETAIL_VIEW_STATUS.READY &&
          (data.available.length > 0 ? (
            data.available.map((tag) => (
              <MenuItem key={tag.id}>
                <button type="button" onClick={() => onAdd(tag)} className={cn(ITEM, 'text-gray-900')}>
                  <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', getTagColor(tag.name).dot)} />
                  <span className="truncate">{tag.name}</span>
                </button>
              </MenuItem>
            ))
          ) : (
            // T9, or no tags exist at all
            <p className="px-3 py-2 text-sm text-gray-600">{data.total > 0 ? TEXT.HAS_EVERY_TAG : TEXT.NO_TAGS}</p>
          ))}
      </MenuItems>
    </Menu>
  );
}
