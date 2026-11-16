import { Button } from '../../../../components/Button';
import { AlertCircleIcon } from '../../../../components/icons';
import { DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { ContactTagsState } from '../../contactsDetailView.types.ts';
import { DetailCard } from '../DetailCard';
import { AddTagMenu } from './AddTagMenu.tsx';
import { ContactTagPill } from './ContactTagPill.tsx';

/** The "Tags" card (mockups T1–T9): remove with ×, add from the picker; each change saves at once, one at a time. */
export function ContactTags({ contactTagsState }: { contactTagsState: ContactTagsState }) {
  const { shownTags, addTagButtonData, isSaving, failure, handleAdd, handleRemove, handleRetryChange, handleRetryTags } =
    contactTagsState;

  return (
    <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.TAGS} aside={DETAIL_VIEW_TEXT.SECTIONS.TAGS_AUTOSAVE}>
      <div className="flex flex-wrap items-center gap-2">
        {shownTags.map(({ tag, isSaving: isTagSaving }) => (
          <ContactTagPill
            key={tag.id}
            tag={tag}
            isSaving={isTagSaving}
            isDisabled={isSaving}
            onRemove={() => handleRemove(tag)}
          />
        ))}
        <AddTagMenu data={addTagButtonData} isDisabled={isSaving} onAdd={handleAdd} onRetry={handleRetryTags} />
      </div>

      {failure && (
        <p role="alert" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-red-700">
          <span className="flex items-center gap-1.5">
            <AlertCircleIcon className="size-4 shrink-0" />
            {failure.message}
          </span>
          {failure.canRetry && (
            <Button variant="link" onClick={handleRetryChange}>
              {DETAIL_VIEW_TEXT.TAGS.RETRY}
            </Button>
          )}
        </p>
      )}
    </DetailCard>
  );
}
