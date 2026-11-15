import type { Kysely } from 'kysely';
import { toContactDto } from '../controllers/contact.dto.js';
import { db } from '../db/client.js';
import type { ContactUpdatedPayload, Database } from '../db/types.js';
import { AppError, notFound } from '../errors/app-error.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as contactRepository from '../repositories/contact.repository.js';
import type { ContactFieldValues, ContactRow, TagRow } from '../repositories/contact.repository.js';
import type { Tag } from '../repositories/tag.repository.js';
import {
  EDITABLE_CONTACT_FIELDS,
  type ListContactsQuery,
  type UpdateContactBody,
} from '../schemas/contact.schemas.js';
import { isUniqueViolation } from '../utils/pg-errors.js';

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

async function withTags(row: ContactRow, executor: Kysely<Database> = db): Promise<ContactWithTags> {
  const tagRows = await contactRepository.findTagsByContactIds([row.id], executor);
  return { ...row, tags: tagRows.map(({ id, name }) => ({ id, name })) };
}

/** One contact with its tags (and its version, which an edit must send back). */
export async function getContact(id: number): Promise<ContactWithTags> {
  const row = await contactRepository.findById(id);
  if (!row) {
    throw notFound('Contact not found', { contactId: id });
  }
  return withTags(row);
}

type FieldChanges = ContactUpdatedPayload['changes'];

/** The fields whose new value differs from the current one (the body is already normalised). */
function diffFields(current: ContactRow, body: UpdateContactBody): FieldChanges {
  const changes: FieldChanges = {};
  for (const field of EDITABLE_CONTACT_FIELDS) {
    const to = body[field];
    if (to !== undefined && to !== current[field]) {
      changes[field] = { from: current[field], to };
    }
  }
  return changes;
}

function toValues(changes: FieldChanges): ContactFieldValues {
  const values: Record<string, string | null> = {};
  for (const [field, change] of Object.entries(changes)) {
    values[field] = change.to;
  }
  return values as ContactFieldValues;
}

/**
 * Edits a contact with optimistic locking (CLAUDE.md §7), in one transaction:
 * - missing contact → 404;
 * - nothing actually changes → the current contact, no version bump, no activity row;
 * - the version the client read is stale → 409 VERSION_CONFLICT with the current contact;
 * - the new email belongs to another contact (any case) → 409 EMAIL_TAKEN;
 * - otherwise the row is updated (version + 1) and a CONTACT_UPDATED activity lists only the
 *   fields that changed.
 */
export async function updateContact(id: number, body: UpdateContactBody): Promise<ContactWithTags> {
  try {
    return await db.transaction().execute(async (trx) => {
      const current = await contactRepository.findById(id, trx);
      if (!current) {
        throw notFound('Contact not found', { contactId: id });
      }

      const changes = diffFields(current, body);
      if (Object.keys(changes).length === 0) {
        return withTags(current, trx);
      }

      // Also covers a version that was already stale when we read the row: the WHERE simply
      // matches nothing. The diff above is only used when this succeeds, i.e. when the row
      // is still exactly the one we read.
      const updated = await contactRepository.updateIfVersion(id, body.version, toValues(changes), trx);
      if (!updated) {
        // A new statement, so it sees the latest committed row (whoever won the race).
        const latest = await contactRepository.findById(id, trx);
        if (!latest) {
          throw notFound('Contact not found', { contactId: id });
        }
        throw new AppError('VERSION_CONFLICT', 409, 'Contact was modified by someone else', {
          // The response DTO, so the client can show "their" values next to its own.
          current: toContactDto(await withTags(latest, trx)),
        });
      }

      await activityRepository.insertMany([{ contactId: id, type: 'CONTACT_UPDATED', payload: { changes } }], trx);
      return withTags(updated, trx);
    });
  } catch (err) {
    // The unique index compares lower(email), so "Asha@x.com" clashes with "asha@x.com".
    if (isUniqueViolation(err, 'contacts_email_unique')) {
      throw new AppError('EMAIL_TAKEN', 409, 'Another contact already uses this email', { field: 'email' });
    }
    throw err;
  }
}
