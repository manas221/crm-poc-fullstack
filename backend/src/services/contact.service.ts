import * as contactRepository from '../repositories/contact.repository.js';
import type { ContactRow, TagRow } from '../repositories/contact.repository.js';
import type { ListContactsQuery } from '../schemas/contact.schemas.js';

export interface Tag {
  id: number;
  name: string;
}

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
export async function listContacts({ page, limit, sort, order }: ListContactsQuery): Promise<ContactPage> {
  const [rows, total] = await Promise.all([
    contactRepository.findPage({ sort, order, limit, offset: (page - 1) * limit }),
    contactRepository.count(),
  ]);

  const tagRows = await contactRepository.findTagsByContactIds(rows.map((r) => r.id));
  const tagsByContact = groupTagsByContact(tagRows);

  return {
    data: rows.map((row) => ({ ...row, tags: tagsByContact.get(row.id) ?? [] })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
