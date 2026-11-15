import { Router } from 'express';
import * as tagController from '../controllers/tag.controller.js';

export const tagRouter = Router();

tagRouter.get('/', tagController.listTags);
