import { useLocation, useNavigate, useParams } from 'react-router';
import { ApiError } from '../../../api/client.ts';
import { CONTACT_TAG_ACTIONS } from '../../../constants/contact.ts';
import {
  useContactActivitiesQuery,
  useContactQuery,
  useContactTagMutation,
  useTagsQuery,
  type ContactTagAction,
} from '../../../queries/contacts-queries.ts';
import type { Tag } from '../../../types/api.ts';
import { isFromList } from '../../../utils/navigation.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import { getTagChangeFailure, parseContactId } from '../contactsDetailView.helpers.ts';
import type {
  ActivityFeedData,
  ContactDetailData,
  ContactTagsState,
  ShownTag,
  TagPickerData,
} from '../contactsDetailView.types.ts';

/**
 * Everything the detail page needs, in one place (like useContactsListView): the contact id
 * from the URL, the query built from it, derived view state and the action handlers.
 */
export function useContactsDetailView() {
  const { id } = useParams();
  const contactId = parseContactId(id);
  const contactQuery = useContactQuery(contactId);

  const activitiesQuery = useContactActivitiesQuery(contactId);
  const tagsQuery = useTagsQuery();
  const tagMutation = useContactTagMutation();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { data, error, isError, isFetching } = contactQuery;

  let contactData: ContactDetailData;
  if (contactId === null || (error instanceof ApiError && error.code === 'NOT_FOUND')) {
    contactData = { status: DETAIL_VIEW_STATUS.NOT_FOUND };
  } else if (data) {
    contactData = { status: DETAIL_VIEW_STATUS.READY, contact: data };
  } else if (isError && !isFetching) {
    contactData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    contactData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  const handleBack = () => {
    if (isFromList(state)) {
      void navigate(-1);
    } else {
      void navigate('/', { replace: true });
    }
  };

  const handleRetry = () => void contactQuery.refetch();
  const handleActivityRetry = () => void activitiesQuery.refetch();


  // for recent activity component
  let activityData: ActivityFeedData;
  if (activitiesQuery.data) {
    // While a refetch runs (after an edit or a tag change) the current entries stay on screen.
    activityData = { status: DETAIL_VIEW_STATUS.READY, activities: activitiesQuery.data };
  } else if (activitiesQuery.isError && !activitiesQuery.isFetching) {
    activityData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    activityData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  // for tags component
  const contactTags = data?.tags ?? [];
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

  const contactTagsState: ContactTagsState = {
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

  return {
    contactData,
    activityData,
    contactTagsState,
    handleBack,
    handleRetry,
    handleActivityRetry,
  };
}
