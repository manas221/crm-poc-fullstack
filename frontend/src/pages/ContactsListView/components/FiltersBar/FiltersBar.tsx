import { Button } from '../../../../components/Button';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { CompanyFilter } from '../CompanyFilter';
import { SearchInput } from '../SearchInput';
import { TagsFilter, type TagOptionsData } from '../TagsFilter';

interface FiltersBarProps {
  q: string | undefined;
  company: string | undefined;
  tagIds: number[];
  tagOptions: TagOptionsData;
  hasFilters: boolean;
  onSearch: (q: string) => void;
  onCompanyChange: (company: string) => void;
  onTagsChange: (tagIds: number[]) => void;
  onRetryTags: () => void;
  onClearFilters: () => void;
}

/** Search box, company and tags filters, and "Clear filters" once anything is applied. */
export function FiltersBar({
  q,
  company,
  tagIds,
  tagOptions,
  hasFilters,
  onSearch,
  onCompanyChange,
  onTagsChange,
  onRetryTags,
  onClearFilters,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput value={q ?? ''} onSearch={onSearch} />
      <CompanyFilter value={company} onChange={onCompanyChange} />
      <TagsFilter options={tagOptions} value={tagIds} onChange={onTagsChange} onRetry={onRetryTags} />
      {hasFilters && (
        <Button variant="link" className="px-2" onClick={onClearFilters}>
          {LIST_VIEW_TEXT.FILTERS.CLEAR_FILTERS}
        </Button>
      )}
    </div>
  );
}
