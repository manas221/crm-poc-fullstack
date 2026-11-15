import type { ActivityType } from '../types/api.ts';

// Edit-form limits. They mirror updateContactBodySchema in backend/src/schemas/contact.schemas.ts;
// the backend enforces them anyway, these let the form say what's wrong before saving.

export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export { MAX_COMPANY_LENGTH } from './list.ts';

/** Digits, spaces, ( ) and -, optionally starting with +; 7–20 characters after the +. */
export const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;

/**
 * Something@something.tld, no spaces. Looser than the backend's check: anything that passes here
 * but not there comes back as a field error from the server instead.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** What a tag change on one contact does (useContactTagMutation). */
export const CONTACT_TAG_ACTIONS = {
  ADD: 'add',
  REMOVE: 'remove',
} as const;

export const ACTIVITY_TYPES = {
  CONTACT_UPDATED: 'CONTACT_UPDATED',
  TAG_ADDED: 'TAG_ADDED',
  TAG_REMOVED: 'TAG_REMOVED',
} as const satisfies Record<string, ActivityType>;

/** How many entries "Recent activity" shows (the backend's default; its max is 50). */
export const ACTIVITY_LIMIT = 10;
