/** How long the copy button shows its result (check / cross) before going back to the copy icon. */
export const COPY_FEEDBACK_MS = 1500;

export const COPY_STATUS = {
  IDLE: 'idle',
  COPIED: 'copied',
  FAILED: 'failed',
} as const;

export type CopyStatus = (typeof COPY_STATUS)[keyof typeof COPY_STATUS];

/** Announced to screen readers after a copy. */
export const COPY_TEXT = {
  COPIED: 'Copied',
  FAILED: 'Couldn’t copy',
} as const;
