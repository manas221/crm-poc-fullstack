import { Router } from 'express';
import * as companyController from '../controllers/company.controller.js';

export const companyRouter = Router();

companyRouter.get('/', companyController.listCompanies);
