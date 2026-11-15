import type { DataResponse, Tag } from '../types/api.ts';
import { apiClient } from './client.ts';

export async function listTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<DataResponse<Tag>>('/api/tags');
  return data.data;
}
