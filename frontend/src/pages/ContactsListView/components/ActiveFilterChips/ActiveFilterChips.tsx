import type { Tag } from '../../../../types/api.ts';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { FilterChip } from './FilterChip.tsx';

interface ActiveFilterChipsProps {
  company: string | undefined;
  /** Selected tags whose names are known (the tags list has loaded). */
  tags: Tag[];
  onRemoveCompany: () => void;
  onRemoveTag: (tagId: number) => void;
}

const TEXT = LIST_VIEW_TEXT.FILTERS.CHIPS;

/** One chip per applied company/tag filter. The search isn't repeated here: it's in the search box. */
export function ActiveFilterChips({ company, tags, onRemoveCompany, onRemoveTag }: ActiveFilterChipsProps) {
  if (!company && tags.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {company && <FilterChip label={TEXT.COMPANY} value={company} onRemove={onRemoveCompany} />}
      {tags.map((tag) => (
        <FilterChip key={tag.id} label={TEXT.TAG} value={tag.name} onRemove={() => onRemoveTag(tag.id)} />
      ))}
    </ul>
  );
}
