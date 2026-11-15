/**
 * History state set by the list's links into a contact. With it, the detail page's "Back to
 * contacts" goes back in history, so the list returns with its search, filters and page as
 * they were. Without it (a deep link, a new tab) there is no list behind us to go back to.
 * History state survives a refresh, so a reloaded detail page still knows.
 */
export interface FromListState {
  fromContactsList: true;
}

export const FROM_LIST_STATE: FromListState = { fromContactsList: true };

export function isFromList(state: unknown): state is FromListState {
  return typeof state === 'object' && state !== null && 'fromContactsList' in state && state.fromContactsList === true;
}
