import type {
  BulkAssignTagRequest,
  BulkAssignTagResponse,
  ContactListResponse,
  ListContactsParams,
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
