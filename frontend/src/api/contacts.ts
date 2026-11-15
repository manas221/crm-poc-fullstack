import type {
  Activity,
  BulkAssignTagRequest,
  BulkAssignTagResponse,
  Contact,
  ContactListResponse,
  DataResponse,
  ListContactsParams,
  UpdateContactRequest,
} from '../types/api.ts';
import { apiClient } from './client.ts';

/**
 * The backend expects `tags=2,5`; axios would send an array as `tags[]=2&tags[]=5`, which it
 * rejects. Empty values are left out (axios drops undefined params), since the backend
 * rejects unknown or malformed params rather than ignoring them.
 */
function toQueryParams({ q, company, tags, ...rest }: ListContactsParams) {
  return {
    ...rest,
    q: q || undefined,
    company: company || undefined,
    tags: tags && tags.length > 0 ? tags.join(',') : undefined,
  };
}

export async function listContacts(params: ListContactsParams): Promise<ContactListResponse> {
  const { data } = await apiClient.get<ContactListResponse>('/api/contacts', { params: toQueryParams(params) });
  return data;
}

export async function bulkAssignTag(body: BulkAssignTagRequest): Promise<BulkAssignTagResponse> {
  const { data } = await apiClient.post<BulkAssignTagResponse>('/api/contacts/bulk/tags', body);
  return data;
}

export async function getContact(id: number): Promise<Contact> {
  const { data } = await apiClient.get<Contact>(`/api/contacts/${id}`);
  return data;
}

export async function updateContact(id: number, body: UpdateContactRequest): Promise<Contact> {
  const { data } = await apiClient.patch<Contact>(`/api/contacts/${id}`, body);
  return data;
}

/** Returns the contact with its tags. Safe to repeat: adding a tag it already has is a no-op. */
export async function addContactTag(contactId: number, tagId: number): Promise<Contact> {
  const { data } = await apiClient.post<Contact>(`/api/contacts/${contactId}/tags`, { tagId });
  return data;
}

/** Returns the contact with its tags. Safe to repeat: removing a tag it doesn't have is a no-op. */
export async function removeContactTag(contactId: number, tagId: number): Promise<Contact> {
  const { data } = await apiClient.delete<Contact>(`/api/contacts/${contactId}/tags/${tagId}`);
  return data;
}

/** The contact's newest activity entries, newest first. */
export async function listContactActivities(contactId: number, limit: number): Promise<Activity[]> {
  const { data } = await apiClient.get<DataResponse<Activity>>(`/api/contacts/${contactId}/activities`, {
    params: { limit },
  });
  return data.data;
}
