import { notFound } from '../errors/app-error.js';
import * as contactRepository from '../repositories/contact.repository.js';
import type { ContactRow, TagRow } from '../repositories/contact.repository.js';
import type { Tag } from '../repositories/tag.repository.js';
import type { ListContactsQuery } from '../schemas/contact.schemas.js';

export type { Tag };

export type ContactWithTags = ContactRow & { tags: Tag[] };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactPage {
  data: ContactWithTags[];
  pagination: Pagination;
}

function groupTagsByContact(rows: readonly TagRow[]): Map<number, Tag[]> {
  const byContact = new Map<number, Tag[]>();
  for (const { contactId, id, name } of rows) {
    const tags = byContact.get(contactId) ?? [];
    tags.push({ id, name });
    byContact.set(contactId, tags);
  }
  return byContact;
}

/**
 * Offset pagination plus COUNT(*): fine at seed scale (see README for cursor pagination
 * and approximate counts at millions of rows). A page past the end returns empty data
 * with the real total, not a 404.
 */
export async function listContacts({ page, limit, sort, order, q, company, tags }: ListContactsQuery): Promise<ContactPage> {
  const filters = { q, company, tagIds: tags };
  const [rows, total] = await Promise.all([
    contactRepository.findPage({ filters, sort, order, limit, offset: (page - 1) * limit }),
    contactRepository.count(filters),
  ]);

  // Every tag of each contact is returned, not only the ones matched by the tags filter.

  const tagRows = await contactRepository.findTagsByContactIds(rows.map((r) => r.id));
  const tagsByContact = groupTagsByContact(tagRows);

  return {
    data: rows.map((row) => ({ ...row, tags: tagsByContact.get(row.id) ?? [] })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** One contact with its tags (and its version, which an edit must send back). */
export async function getContact(id: number): Promise<ContactWithTags> {
  const row = await contactRepository.findById(id);
  if (!row) {
    throw notFound('Contact not found', { contactId: id });
  }
  const tagRows = await contactRepository.findTagsByContactIds([id]);
  return { ...row, tags: tagRows.map(({ id: tagId, name }) => ({ id: tagId, name })) };
}
