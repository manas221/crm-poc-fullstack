import { useCallback, useReducer } from 'react';
import { ROW_SELECTION_ACTION_TYPES } from '../contactsListView.constants.ts';
import type { RowSelectionAction, RowSelectionState } from '../contactsListView.types.ts';

const NO_IDS: ReadonlySet<number> = new Set();

/**
 * Every action is applied within `scopeKey`: a selection made under another key (an earlier
 * page or filter) is dropped first, so it can never leak into the current list.
 */
function rowSelectionReducer(
  state: RowSelectionState,
  { scopeKey, action }: { scopeKey: string; action: RowSelectionAction },
): RowSelectionState {
  const current = state.scopeKey === scopeKey ? state.ids : NO_IDS;

  switch (action.type) {
    case ROW_SELECTION_ACTION_TYPES.TOGGLE: {
      const ids = new Set(current);
      if (ids.has(action.id)) {
        ids.delete(action.id);
      } else {
        ids.add(action.id);
      }
      return { scopeKey, ids };
    }
    case ROW_SELECTION_ACTION_TYPES.SELECT_MANY:
      return { scopeKey, ids: new Set([...current, ...action.ids]) };
    case ROW_SELECTION_ACTION_TYPES.CLEAR:
      return { scopeKey, ids: NO_IDS };
  }
}

/**
 * Checked rows. The selection is stored together with the key of the list query it was made
 * in (`scopeKey`). When the key changes (search, filter, sort, page, page size, Back) the
 * selection is flushed: a bulk action can only ever reach rows picked in the list on screen,
 * and coming back to an earlier page or search doesn't bring its old selection back.
 */
export function useRowSelection(scopeKey: string): {
  selectedIds: ReadonlySet<number>;
  onSelectionAction: (action: RowSelectionAction) => void;
} {
  const [state, dispatch] = useReducer(rowSelectionReducer, { scopeKey, ids: NO_IDS });

  // The list changed: flush the old selection. Done during render ("adjust state when a prop
  // changes"), not in an effect, so the next list never renders with the old ids for a frame.
  // React re-runs this render with the cleared state before anything is committed.
  if (state.scopeKey !== scopeKey) {
    dispatch({ scopeKey, action: { type: ROW_SELECTION_ACTION_TYPES.CLEAR } });
  }

  const onSelectionAction = useCallback(
    (action: RowSelectionAction) => dispatch({ scopeKey, action }),
    [scopeKey],
  );

  // The check still matters for the render that dispatched the flush above.
  return { selectedIds: state.scopeKey === scopeKey ? state.ids : NO_IDS, onSelectionAction };
}
