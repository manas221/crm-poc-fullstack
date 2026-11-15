import type { Request, Response } from 'express';
import { listCompaniesQuerySchema } from '../schemas/company.schemas.js';
import * as companyService from '../services/company.service.js';

export async function listCompanies(req: Request, res: Response): Promise<void> {
  const query = listCompaniesQuerySchema.parse(req.query);
  const companies = await companyService.listCompanies(query);
  res.json({ data: companies });
}
