import { DETAIL_VIEW_STATUS } from './contactsDetailView.constants.ts';
import type { ContactDetailData, FailedContactStatus } from './contactsDetailView.types.ts';

/**
 * The :id route param as a contact id, or null when it can't be one ("abc", "0", "1.5",
 * "007"). Same rule as the backend's contactIdParamsSchema, so a malformed link shows "not
 * found" straight away instead of sending a request that would only come back as a 400.
 */
export function parseContactId(raw: string | undefined): number | null {
  if (!raw || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

/** Not found or failed to load. Narrows `data`, so code after the check only sees loading / ready. */
export function isFailedContactData(
  data: ContactDetailData,
): data is Extract<ContactDetailData, { status: FailedContactStatus }> {
  return data.status === DETAIL_VIEW_STATUS.NOT_FOUND || data.status === DETAIL_VIEW_STATUS.ERROR;
}
