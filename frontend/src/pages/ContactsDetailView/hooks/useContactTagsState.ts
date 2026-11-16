import { CONTACT_TAG_ACTIONS } from '../../../constants/contact.ts';
import { useContactTagMutation, useTagsQuery, type ContactTagAction } from '../../../queries/contacts-queries.ts';
import type { Tag } from '../../../types/api.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import { getTagChangeFailure } from '../contactsDetailView.helpers.ts';
import type { ContactTagsState, ShownTag, TagPickerData } from '../contactsDetailView.types.ts';

/**
 * The Tags card's state: the contact's tags, what "Add tag" offers, and the handlers. Called
 * by useContactsDetailView (not by the card), so other parts of the page can use it too.
 * `contactId` is null and `contactTags` empty until the contact has loaded.
 */
export function useContactTagsState(contactId: number | null, contactTags: Tag[]): ContactTagsState {
  const tagsQuery = useTagsQuery();
  const tagMutation = useContactTagMutation();

  const assignedIds = new Set(contactTags.map((tag) => tag.id));
  const savingTag = tagMutation.isPending ? tagMutation.variables : undefined;

  const shownTags: ShownTag[] = contactTags.map((tag) => ({
    tag,
    isSaving: savingTag?.action === CONTACT_TAG_ACTIONS.REMOVE && savingTag.tag.id === tag.id,
  }));
  // Not on the contact yet: shown at the end, with a spinner, until the refetch brings it in.
  if (savingTag?.action === CONTACT_TAG_ACTIONS.ADD && !assignedIds.has(savingTag.tag.id)) {
    shownTags.push({ tag: savingTag.tag, isSaving: true });
  }

  let addTagButtonData: TagPickerData;
  if (tagsQuery.data) {
    addTagButtonData = {
      status: DETAIL_VIEW_STATUS.READY,
      available: tagsQuery.data.filter((tag) => !assignedIds.has(tag.id)),
      total: tagsQuery.data.length,
    };
  } else if (tagsQuery.isError && !tagsQuery.isFetching) {
    addTagButtonData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    addTagButtonData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  // A new attempt clears the previous error: the mutation goes back to pending.
  const changeTag = (action: ContactTagAction, tag: Tag) => {
    if (contactId !== null) {
      tagMutation.mutate({ contactId, action, tag });
    }
  };

  return {
    shownTags,
    addTagButtonData,
    isSaving: tagMutation.isPending,
    failure: tagMutation.isError ? getTagChangeFailure(tagMutation.error, tagMutation.variables) : null,
    handleAdd: (tag) => changeTag(CONTACT_TAG_ACTIONS.ADD, tag),
    handleRemove: (tag) => changeTag(CONTACT_TAG_ACTIONS.REMOVE, tag),
    handleRetryChange: () => {
      if (tagMutation.variables) {
        tagMutation.mutate(tagMutation.variables);
      }
    },
    handleRetryTags: () => void tagsQuery.refetch(),
  };
}
