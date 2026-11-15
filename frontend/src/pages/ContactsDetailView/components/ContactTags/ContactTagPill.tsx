import { SpinnerIcon, XIcon } from '../../../../components/icons';
import { TagPill } from '../../../../components/TagPill';
import type { Tag } from '../../../../types/api.ts';
import { DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';

interface ContactTagPillProps {
  tag: Tag;
  /** Being added or removed: a spinner replaces the remove button (mockup T5). */
  isSaving: boolean;
  onRemove: () => void;
}

export function ContactTagPill({ tag, isSaving, onRemove }: ContactTagPillProps) {
  return (
    <TagPill name={tag.name} size="md" className={isSaving ? 'opacity-70' : undefined}>
      {isSaving ? (
        <SpinnerIcon className="size-3.5" role="status" aria-hidden={false} aria-label={DETAIL_VIEW_TEXT.TAGS.SAVING_ARIA_LABEL(tag.name)} />
      ) : (
        <button
          type="button"
          onClick={onRemove}
          aria-label={DETAIL_VIEW_TEXT.TAGS.REMOVE_ARIA_LABEL(tag.name)}
          className="-mr-1 rounded-full p-0.5 opacity-70 hover:bg-black/5 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </TagPill>
  );
}
