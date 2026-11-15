import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { INITIAL_SORT_ORDER, LIST_VIEW_ACTION_TYPES, SORT_ORDER } from '../contactsListView.constants.ts';
import {
  normalizeCompany,
  normalizeSearch,
  normalizeTagIds,
  parseListParams,
  toSearchParams,
} from '../contactsListView.helpers.ts';
import type { ListAction, ListParams } from '../contactsListView.types.ts';

/**
 * Any change to what is shown (search, filters, sort, page size) goes back to page 1, so you
 * never land past the last page. Only PAGE moves between pages.
 */
export function listParamsReducer(state: ListParams, action: ListAction): ListParams {
  switch (action.type) {
    case LIST_VIEW_ACTION_TYPES.SEARCH: {
      const q = normalizeSearch(action.q);
      if (q === (state.q ?? '')) {
        return state; // e.g. a trailing space: same search, so keep the current page
      }
      return { ...state, q: q || undefined, page: 1 };
    }
    case LIST_VIEW_ACTION_TYPES.SORT: {
      // Same column again: flip the direction. Another column: start in its natural direction.
      const order =
        action.sort === state.sort
          ? state.order === SORT_ORDER.ASC
            ? SORT_ORDER.DESC
            : SORT_ORDER.ASC
          : INITIAL_SORT_ORDER[action.sort];
      return { ...state, sort: action.sort, order, page: 1 };
    }
    case LIST_VIEW_ACTION_TYPES.CLEAR_FILTERS:
      return { ...state, q: undefined, company: undefined, tags: undefined, page: 1 };
    case LIST_VIEW_ACTION_TYPES.COMPANY: {
      const company = normalizeCompany(action.company);
      return company === state.company ? state : { ...state, company, page: 1 };
    }
    case LIST_VIEW_ACTION_TYPES.TAGS: {
      const tags = normalizeTagIds(action.tags);
      const isSame = tags.join(',') === (state.tags ?? []).join(',');
      return isSame ? state : { ...state, tags: tags.length > 0 ? tags : undefined, page: 1 };
    }
    case LIST_VIEW_ACTION_TYPES.PAGE:
      return { ...state, page: Math.max(1, Math.floor(action.page)) };
    case LIST_VIEW_ACTION_TYPES.LIMIT:
      // A new page size reshuffles every page, so start again from the first one.
      return action.limit === state.limit ? state : { ...state, limit: action.limit, page: 1 };
  }
}

/**
 * The list params, read from the URL, and a `onAction` that applies an action to them and
 * writes the result back to the URL. The URL is the only copy: Back/Forward and shared links
 * work without any syncing.
 */
export function useListParams(): { params: ListParams; onAction: (action: ListAction) => void } {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseListParams(searchParams), [searchParams]);

  const onAction = useCallback(
    (action: ListAction) => {
      const listState = listParamsReducer(params, action);
      const nextQuery = toSearchParams(listState);
      // Nothing changed (e.g. "Clear filters" with no filters): don't add a history entry.
      if (nextQuery.toString() === toSearchParams(params).toString()) {
        return;
      }
      setSearchParams(nextQuery);
    },
    [params, setSearchParams],
  );

  return { params, onAction };
}
