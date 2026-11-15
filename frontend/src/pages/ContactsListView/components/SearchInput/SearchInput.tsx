import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { SearchIcon } from '../../../../components/icons';
import { MAX_SEARCH_LENGTH, MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '../../../../constants/list.ts';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue.ts';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { normalizeSearch } from '../../contactsListView.helpers.ts';

interface SearchInputProps {
  /** The search currently in the URL. */
  value: string;
  /** Called with the normalized search ('' = no search) once typing pauses, or on Enter. */
  onSearch: (q: string) => void;
}

/**
 * The text being typed (draft) is local; only the debounced, normalized value goes to the URL.
 */
export function SearchInput({ value, onSearch }: SearchInputProps) {
  const hintId = useId();
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // The URL changed (Back button, Clear filters): show its value. This is the "adjust state
  // when a prop changes" pattern, done during render instead of in an effect. Skip it when the
  // URL only caught up with what is typed, or typing "asha " would lose the space mid-word.
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== normalizeSearch(draft)) {
      setDraft(value);
    }
  }

  const debouncedDraft = useDebouncedValue(draft, SEARCH_DEBOUNCE_MS);

  // Deliberately depends only on the debounced draft: it runs after the user typed. After a
  // URL change the draft is reset to the URL value, so this ends up comparing equal and does
  // nothing; depending on `value` too would re-send a stale draft right after Back.
  useEffect(() => {
    const q = normalizeSearch(debouncedDraft);
    if (q !== value) {
      onSearch(q);
    }
  }, [debouncedDraft]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const q = normalizeSearch(draft);
      if (q !== value) {
        onSearch(q); // search now, without waiting for the debounce
      }
    }
  }

  const tooShort = draft.trim().length > 0 && draft.trim().length < MIN_SEARCH_LENGTH;

  return (
    <div className="relative w-full max-w-md">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MAX_SEARCH_LENGTH}
        placeholder={LIST_VIEW_TEXT.SEARCH.PLACEHOLDER}
        aria-label={LIST_VIEW_TEXT.SEARCH.ARIA_LABEL}
        aria-describedby={tooShort ? hintId : undefined}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      />
      {tooShort && (
        <p id={hintId} className="absolute top-full left-0 mt-1 text-xs text-gray-500">
          {LIST_VIEW_TEXT.SEARCH.TOO_SHORT(MIN_SEARCH_LENGTH)}
        </p>
      )}
    </div>
  );
}
