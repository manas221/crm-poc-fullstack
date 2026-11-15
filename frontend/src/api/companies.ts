import type { Company, DataResponse, ListCompaniesParams } from '../types/api.ts';
import { apiClient } from './client.ts';

export async function listCompanies({ q, limit }: ListCompaniesParams): Promise<Company[]> {
  const { data } = await apiClient.get<DataResponse<Company>>('/api/companies', {
    params: { q: q?.trim() || undefined, limit },
  });
  return data.data;
}
