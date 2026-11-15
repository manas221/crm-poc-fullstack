import * as companyRepository from '../repositories/company.repository.js';
import type { CompanyRow } from '../repositories/company.repository.js';
import type { ListCompaniesQuery } from '../schemas/company.schemas.js';

export async function listCompanies(query: ListCompaniesQuery): Promise<CompanyRow[]> {
  return companyRepository.findCompanies(query);
}
