import { Router } from 'express';
import * as contactTagController from '../controllers/contact-tag.controller.js';
import * as contactController from '../controllers/contact.controller.js';

export const contactRouter = Router();

contactRouter.get('/', contactController.listContacts);
// Keep fixed paths like /bulk/... above the /:id routes, or Express would match "bulk" as a
// contact id.
contactRouter.post('/bulk/tags', contactTagController.bulkAssignTag);
contactRouter.get('/:id', contactController.getContact);
