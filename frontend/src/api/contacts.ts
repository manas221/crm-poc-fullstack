import type { ContactListResponse, ListContactsParams } from '../types/api.ts';
import { apiClient } from './client.ts';

export async function listContacts(params: ListContactsParams): Promise<ContactListResponse> {
  const { data } = await apiClient.get<ContactListResponse>('/api/contacts', { params });
  return data;
}
