import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import * as contactTagController from '../controllers/contact-tag.controller.js';
import * as contactController from '../controllers/contact.controller.js';

export const contactRouter = Router();

contactRouter.get('/', contactController.listContacts);
// Keep fixed paths like /bulk/... above the /:id routes, or Express would match "bulk" as a
// contact id.
contactRouter.post('/bulk/tags', contactTagController.bulkAssignTag);
contactRouter.get('/:id', contactController.getContact);
contactRouter.patch('/:id', contactController.updateContact);
contactRouter.post('/:id/tags', contactTagController.addTag);
contactRouter.delete('/:id/tags/:tagId', contactTagController.removeTag);
contactRouter.get('/:id/activities', activityController.listActivities);
