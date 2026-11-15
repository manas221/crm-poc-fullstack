import { sql } from 'kysely';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const OLD = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));

// c2 already has VIP. Every contact starts with updated_at in the past, so a bump shows.
let vip: number;
let c1: number;
let c2: number;
let c3: number;
let c4: number;

beforeEach(async () => {
  await resetDatabase();
  vip = await insertTag('VIP');
  await insertTag('Lead');
  c1 = await insertContact({ firstName: 'A', lastName: 'One', createdAt: OLD, updatedAt: OLD });
  c2 = await insertContact({ firstName: 'B', lastName: 'Two', createdAt: OLD, updatedAt: OLD }, [vip]);
  c3 = await insertContact({ firstName: 'C', lastName: 'Three', createdAt: OLD, updatedAt: OLD });
  c4 = await insertContact({ firstName: 'D', lastName: 'Four', createdAt: OLD, updatedAt: OLD });
});

const bulk = (body: unknown) => request(app).post('/api/contacts/bulk/tags').send(body as object);

const taggedWith = async (tagId: number) =>
  (await db.selectFrom('contactTags').select('contactId').where('tagId', '=', tagId).orderBy('contactId').execute()).map(
    (r) => r.contactId,
  );

const activities = () =>
  db.selectFrom('contactActivities').select(['contactId', 'type', 'payload']).orderBy('contactId').execute();

/** Resolves once some query in this database is waiting on a lock. */
async function waitForBlockedQuery(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const { rows } = await sql<{ waiting: number }>`
      SELECT count(*) AS waiting FROM pg_stat_activity
      WHERE datname = current_database() AND wait_event_type = 'Lock'`.execute(db);
    if ((rows[0]?.waiting ?? 0) > 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('The request never blocked on the open transaction');
}

const contactsById = async () =>
  new Map(
    (await db.selectFrom('contacts').select(['id', 'version', 'updatedAt']).execute()).map((c) => [c.id, c]),
  );

describe('POST /api/contacts/bulk/tags', () => {
  it('tags the contacts that lack the tag and skips the ones that have it', async () => {
    const res = await bulk({ contactIds: [c3, c1, c2], tagId: vip });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tagId: vip, requested: 3, added: 2 });
    expect(await taggedWith(vip)).toEqual([c1, c2, c3]);
  });

  it('writes a TAG_ADDED activity only for newly tagged contacts', async () => {
    await bulk({ contactIds: [c1, c2, c3], tagId: vip });

    expect(await activities()).toEqual([
      { contactId: c1, type: 'TAG_ADDED', payload: { tagId: vip, tagName: 'VIP', bulk: true } },
      { contactId: c3, type: 'TAG_ADDED', payload: { tagId: vip, tagName: 'VIP', bulk: true } },
    ]);
  });

  it('bumps updated_at only for newly tagged contacts and never changes version', async () => {
    await bulk({ contactIds: [c1, c2, c3], tagId: vip });

    const contacts = await contactsById();
    expect(contacts.get(c1)?.updatedAt.getTime()).toBeGreaterThan(OLD.getTime());
    expect(contacts.get(c3)?.updatedAt.getTime()).toBeGreaterThan(OLD.getTime());
    expect(contacts.get(c2)?.updatedAt).toEqual(OLD); // already had the tag
    expect(contacts.get(c4)?.updatedAt).toEqual(OLD); // not in the request
    expect([...contacts.values()].map((c) => c.version)).toEqual([1, 1, 1, 1]);
  });

  it('is safe to repeat: nothing is added and no activity is written the second time', async () => {
    await bulk({ contactIds: [c1, c3], tagId: vip });
    const again = await bulk({ contactIds: [c1, c3], tagId: vip });

    expect(again.body).toEqual({ tagId: vip, requested: 2, added: 0 });
    expect(await taggedWith(vip)).toEqual([c1, c2, c3]);
    expect(await activities()).toHaveLength(2);
  });

  it('handles overlapping requests at the same time without duplicates or deadlocks', async () => {
    const orders = [
      [c1, c3, c4],
      [c4, c3, c1],
      [c3, c1, c4],
      [c1, c4],
      [c4, c3],
    ];
    const results = await Promise.all(orders.map((contactIds) => bulk({ contactIds, tagId: vip })));

    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
    // Three contacts were missing the tag, so across all requests exactly three were added.
    expect(results.reduce((sum, r) => sum + r.body.added, 0)).toBe(3);
    expect(await taggedWith(vip)).toEqual([c1, c2, c3, c4]);
    expect((await activities()).map((a) => a.contactId)).toEqual([c1, c3, c4]);
  });

  it('links contacts in id order, so it waits on an overlapping transaction instead of deadlocking', async () => {
    // Another transaction links c3 and holds it open. The request lists [c4, c3]. In request
    // order it would link c4, then block on c3; the transaction then links c4 and blocks on
    // the request: a deadlock. In id order the request blocks on c3 before touching c4.
    let pending!: Promise<request.Response>;
    await db.transaction().execute(async (trx) => {
      await trx.insertInto('contactTags').values({ contactId: c3, tagId: vip }).execute();
      pending = bulk({ contactIds: [c4, c3], tagId: vip }).then((r) => r);
      await waitForBlockedQuery();
      await trx.insertInto('contactTags').values({ contactId: c4, tagId: vip }).execute();
    });

    const res = await pending;
    expect(res.status).toBe(200);
    expect(res.body.added).toBe(0); // the other transaction got there first for both
    expect(await activities()).toEqual([]);
  });

  it('returns 404 for an unknown tag and changes nothing', async () => {
    const res = await bulk({ contactIds: [c1], tagId: 9999 });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { tagId: 9999 } });
    expect(await activities()).toEqual([]);
  });

  it('returns 404 listing missing contacts and tags none of the others', async () => {
    const res = await bulk({ contactIds: [c1, 9999, c3, 9998], tagId: vip });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { missingContactIds: [9999, 9998] } });
    expect(await taggedWith(vip)).toEqual([c2]);
    expect(await activities()).toEqual([]);
    expect((await contactsById()).get(c1)?.updatedAt).toEqual(OLD);
  });

  describe('invalid bodies', () => {
    it.each([
      ['empty contactIds', { contactIds: [], tagId: 1 }, 'contactIds'],
      ['over 1000 contactIds', { contactIds: Array.from({ length: 1001 }, (_, i) => i + 1), tagId: 1 }, 'contactIds'],
      ['duplicate contactIds', { contactIds: [1, 1], tagId: 1 }, 'contactIds'],
      ['string contactIds', { contactIds: ['1'], tagId: 1 }, 'contactIds'],
      ['fractional contactIds', { contactIds: [1.5], tagId: 1 }, 'contactIds'],
      ['zero contactId', { contactIds: [0], tagId: 1 }, 'contactIds'],
      ['missing contactIds', { tagId: 1 }, 'contactIds'],
      ['missing tagId', { contactIds: [1] }, 'tagId'],
      ['string tagId', { contactIds: [1], tagId: '1' }, 'tagId'],
    ])('%s → 400 with a field error', async (_label, body, field) => {
      const res = await bulk(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.fieldErrors).toHaveProperty(field);
    });

    it('rejects unknown fields', async () => {
      const res = await bulk({ contactIds: [1], tagId: 1, version: 3 });
      expect(res.status).toBe(400);
      expect(res.body.error.details.formErrors).toEqual(['Unrecognized key: "version"']);
    });

    it('rejects a missing body', async () => {
      const res = await request(app).post('/api/contacts/bulk/tags');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
