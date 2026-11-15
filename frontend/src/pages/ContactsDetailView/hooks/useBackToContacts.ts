import { useLocation, useNavigate } from 'react-router';
import { isFromList } from '../../../utils/navigation.ts';

/**
 * "Back to contacts". Coming from the list, it goes back in history (pops this entry), so
 * the list returns with its search, filters, page and scroll as they were. Otherwise (a deep
 * link, a new tab) it replaces this entry with the list, so Back doesn't bounce between them.
 */
export function useBackToContacts() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cameFromList = isFromList(state);

  return () => {
    if (cameFromList) {
      void navigate(-1);
    } else {
      void navigate('/', { replace: true });
    }
  };
}
