import type { Request, Response } from 'express';
import { contactIdParamsSchema, listContactsQuerySchema, updateContactBodySchema } from '../schemas/contact.schemas.js';
import * as contactService from '../services/contact.service.js';
import { toContactDto } from './contact.dto.js';

// Express 5 forwards rejected promises to the error middleware, so a ZodError thrown by
// .parse() becomes a 400 VALIDATION_ERROR without try/catch here.

export async function listContacts(req: Request, res: Response): Promise<void> {
  // req.query is a read-only getter in Express 5: parse into a new value, don't reassign it.
  const query = listContactsQuerySchema.parse(req.query);
  const { data, pagination } = await contactService.listContacts(query);
  res.json({ data: data.map(toContactDto), pagination });
}

export async function getContact(req: Request, res: Response): Promise<void> {
  const { id } = contactIdParamsSchema.parse(req.params);
  res.json(toContactDto(await contactService.getContact(id)));
}

export async function updateContact(req: Request, res: Response): Promise<void> {
  const { id } = contactIdParamsSchema.parse(req.params);
  const body = updateContactBodySchema.parse(req.body);
  res.json(toContactDto(await contactService.updateContact(id, body)));
}
