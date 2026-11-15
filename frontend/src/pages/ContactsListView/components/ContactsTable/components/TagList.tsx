import { TagPill } from '../../../../../components/TagPill';
import type { Tag } from '../../../../../types/api.ts';
import { EmptyValue } from './EmptyValue.tsx';

const MAX_VISIBLE_TAGS = 2;

/** First two tags as pills, the rest as "+N" (their names on hover). */
export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return <EmptyValue />;
  }
  const visible = tags.slice(0, MAX_VISIBLE_TAGS);
  const hidden = tags.slice(MAX_VISIBLE_TAGS);

  return (
    <div className="flex items-center gap-1.5 overflow-hidden">
      {visible.map((tag) => (
        <TagPill key={tag.id} name={tag.name} />
      ))}
      {hidden.length > 0 && (
        <span className="text-xs text-gray-500" title={hidden.map((tag) => tag.name).join(', ')}>
          +{hidden.length}
        </span>
      )}
    </div>
  );
}
