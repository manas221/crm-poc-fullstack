import { useCallback, useEffect, useRef, useState } from 'react';
import { COPY_FEEDBACK_MS, COPY_STATUS, type CopyStatus } from '../constants/clipboard.ts';

/**
 * Copies text and reports how it went for a short while, then goes back to idle. Copying can
 * fail (no permission, or no Clipboard API outside a secure context), so that's a status too.
 */
export function useCopyToClipboard(): { status: CopyStatus; copy: (text: string) => Promise<void> } {
  const [status, setStatus] = useState<CopyStatus>(COPY_STATUS.IDLE);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = useCallback(async (text: string) => {
    window.clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus(COPY_STATUS.COPIED);
    } catch {
      setStatus(COPY_STATUS.FAILED);
    }
    resetTimer.current = window.setTimeout(() => setStatus(COPY_STATUS.IDLE), COPY_FEEDBACK_MS);
  }, []);

  return { status, copy };
}
