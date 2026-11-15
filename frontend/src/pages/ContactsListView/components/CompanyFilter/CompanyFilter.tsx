import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { FilterButton } from '../FilterButton';
import { CompanySearchPanel } from './CompanySearchPanel.tsx';

interface CompanyFilterProps {
  /** The company in the URL, if any. */
  value: string | undefined;
  onChange: (company: string) => void;
}

/**
 * "Company" button that opens a searchable list of company names. The panel (and with it the
 * suggestions request and the search text) only exists while open, so opening it starts fresh.
 */
export function CompanyFilter({ value, onChange }: CompanyFilterProps) {
  return (
    <Popover>
      <PopoverButton as={FilterButton} label={LIST_VIEW_TEXT.FILTERS.COMPANY.LABEL} value={value} />
      <PopoverPanel
        anchor="bottom start"
        className="z-20 w-80 rounded-lg border border-gray-200 bg-white p-2 shadow-lg [--anchor-gap:8px] focus:outline-none"
      >
        <CompanySearchPanel value={value} onChange={onChange} />
      </PopoverPanel>
    </Popover>
  );
}
