/** What the page shows, from the contact query (see useContactsDetailView). */
export const DETAIL_VIEW_STATUS = {
  LOADING: 'loading',
  ERROR: 'error',
  NOT_FOUND: 'notFound',
  READY: 'ready',
} as const;

export const DETAIL_VIEW_TEXT = {
  BACK_TO_CONTACTS: 'Back to contacts',
  HEADER: {
    EDIT: 'Edit',
    LOADING: 'Loading contact…',
  },
  NOT_FOUND: {
    TITLE: 'Contact not found',
    DESCRIPTION: 'It may have been deleted, or the link may be wrong.',
  },
  LOAD_ERROR: {
    MESSAGE: 'Couldn’t load this contact. Please try again.',
    RETRY: 'Retry',
  },
  SECTIONS: {
    DETAILS: 'Details',
    EDITING: 'Editing',
    ACTIVITY: 'Recent activity',
    TAGS: 'Tags',
    TAGS_AUTOSAVE: 'Changes save automatically',
  },
} as const;
