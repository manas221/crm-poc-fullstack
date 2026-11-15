import { useState } from 'react';
import { CONTACT_TAG_ACTIONS } from '../../../constants/contact.ts';
import {
  useContactTagMutation,
  usePendingContactTagChanges,
  useTagsQuery,
  type ContactTagChange,
} from '../../../queries/contacts-queries.ts';
import type { Contact, Tag } from '../../../types/api.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import { getTagChangeFailure } from '../contactsDetailView.helpers.ts';
import type { ShownTag, TagChangeFailure, TagPickerData } from '../contactsDetailView.types.ts';

/**
 * The Tags card: the contact's tags plus the ones being added, what the picker offers, and
 * the add / remove / retry handlers. Changes save straight away; several can be in flight.
 */
export function useContactTags(contact: Contact) {
  const tagsQuery = useTagsQuery();
  // The last change that failed (and the change itself, for Retry).
  const [failure, setFailure] = useState<{ change: ContactTagChange; failure: TagChangeFailure } | null>(null);
  const mutation = useContactTagMutation(contact.id, {
    onError: (error, change) => {
      const result = getTagChangeFailure(error, change);
      setFailure(result ? { change, failure: result } : null);
    },
  });
  const pending = usePendingContactTagChanges(contact.id);

  const assignedIds = new Set(contact.tags.map((tag) => tag.id));
  const removingIds = new Set(
    pending.filter((change) => change.action === CONTACT_TAG_ACTIONS.REMOVE).map((change) => change.tag.id),
  );
  // Not on the contact yet: shown at the end, with a spinner, until the refetch brings it in.
  const adding = pending
    .filter((change) => change.action === CONTACT_TAG_ACTIONS.ADD && !assignedIds.has(change.tag.id))
    .map((change) => change.tag);
  const addingIds = new Set(adding.map((tag) => tag.id));

  const shownTags: ShownTag[] = [
    ...contact.tags.map((tag) => ({ tag, isSaving: removingIds.has(tag.id) })),
    ...adding.map((tag) => ({ tag, isSaving: true })),
  ];

  let pickerData: TagPickerData;
  if (tagsQuery.data) {
    pickerData = {
      status: DETAIL_VIEW_STATUS.READY,
      available: tagsQuery.data.filter((tag) => !assignedIds.has(tag.id) && !addingIds.has(tag.id)),
      total: tagsQuery.data.length,
    };
  } else if (tagsQuery.isError && !tagsQuery.isFetching) {
    pickerData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    pickerData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  const change = (next: ContactTagChange) => {
    setFailure(null); // a new attempt replaces the old message
    mutation.mutate(next);
  };

  const handleAdd = (tag: Tag) => change({ action: CONTACT_TAG_ACTIONS.ADD, tag });
  const handleRemove = (tag: Tag) => change({ action: CONTACT_TAG_ACTIONS.REMOVE, tag });
  const handleRetryChange = () => {
    if (failure) {
      change(failure.change);
    }
  };
  const handleRetryTags = () => void tagsQuery.refetch();

  return {
    shownTags,
    pickerData,
    failure: failure?.failure ?? null,
    handleAdd,
    handleRemove,
    handleRetryChange,
    handleRetryTags,
  };
}
