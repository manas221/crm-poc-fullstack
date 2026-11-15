import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, useClose } from '@headlessui/react';
import { useState } from 'react';
import { Button } from '../../../../components/Button';
import { CheckIcon, SearchIcon } from '../../../../components/icons';
import { COMPANY_SUGGESTION_LIMIT, MAX_COMPANY_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '../../../../constants/list.ts';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue.ts';
import { useCompaniesQuery } from '../../../../queries/contacts-queries.ts';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { HighlightedMatch } from './HighlightedMatch.tsx';

interface CompanySearchPanelProps {
  value: string | undefined;
  onChange: (company: string) => void;
}

const TEXT = LIST_VIEW_TEXT.FILTERS.COMPANY;

/** Search box + suggestions. Its search text is local: only the picked company goes to the URL. */
export function CompanySearchPanel({ value, onChange }: CompanySearchPanelProps) {
  const close = useClose();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const { data: companies, isError, isFetching, refetch } = useCompaniesQuery(debouncedQuery);

  function handleChange(company: string | null) {
    if (company) {
      onChange(company);
      close();
    }
  }

  return (
    <Combobox value={value ?? null} onChange={handleChange}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
        <ComboboxInput
          autoFocus
          // Always a search box: never prefilled with the selected company.
          displayValue={() => ''}
          onChange={(event) => setQuery(event.target.value)}
          // The combobox handles Escape itself (its options are always shown), so the popover
          // never sees it: close the popover here, as Escape does for the tags dropdown.
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              close();
            }
          }}
          maxLength={MAX_COMPANY_SEARCH_LENGTH}
          placeholder={TEXT.SEARCH_PLACEHOLDER}
          aria-label={TEXT.SEARCH_ARIA_LABEL}
          className="w-full rounded-md border border-blue-500 py-2 pr-3 pl-9 text-sm text-gray-900 ring-2 ring-blue-500/20 placeholder:text-gray-500 focus:outline-none"
        />
      </div>

      {companies && companies.length > 0 && (
        <ComboboxOptions static className="mt-2 max-h-72 overflow-y-auto">
          {companies.map(({ name }) => (
            <ComboboxOption
              key={name}
              value={name}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-900 data-focus:bg-gray-100"
            >
              <span className="truncate">
                <HighlightedMatch text={name} query={debouncedQuery} />
              </span>
              {name.toLowerCase() === value?.toLowerCase() && <CheckIcon className="size-4 shrink-0 text-blue-600" />}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      )}

      <div className="px-3 pt-2 pb-1 text-xs text-gray-500" aria-live="polite">
        {companies ? (
          companies.length === 0 ? (
            debouncedQuery ? TEXT.NO_MATCHES(debouncedQuery) : TEXT.NO_COMPANIES
          ) : companies.length >= COMPANY_SUGGESTION_LIMIT ? (
            TEXT.FIRST_MATCHES(companies.length)
          ) : (
            TEXT.MATCH_COUNT(companies.length)
          )
        ) : isError && !isFetching ? (
          <span className="flex items-center justify-between gap-2 text-red-700">
            {TEXT.ERROR}
            <Button variant="link" onClick={() => void refetch()}>
              {TEXT.RETRY}
            </Button>
          </span>
        ) : (
          TEXT.LOADING
        )}
      </div>
    </Combobox>
  );
}
