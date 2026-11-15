import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import type { ActivityPayload, ActivityType } from '../src/db/types.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const minute = (n: number) => new Date(Date.UTC(2026, 10, 1, 12, n, 0));

let asha: number;
let bob: number;

beforeEach(async () => {
  await resetDatabase();
  asha = await insertContact({ firstName: 'Asha', lastName: 'Verma' });
  bob = await insertContact({ firstName: 'Bob', lastName: 'Stone' });
});

async function insertActivity(
  contactId: number,
  type: ActivityType,
  payload: ActivityPayload,
  createdAt: Date,
): Promise<number> {
  const { id } = await db
    .insertInto('contactActivities')
    .values({ contactId, type, payload, createdAt })
    .returning('id')
    .executeTakeFirstOrThrow();
  return id;
}

const list = (contactId: number | string, query = '') =>
  request(app).get(`/api/contacts/${contactId}/activities${query}`);

describe('GET /api/contacts/:id/activities', () => {
  it('returns the activity DTOs, newest first', async () => {
    const older = await insertActivity(asha, 'TAG_ADDED', { tagId: 1, tagName: 'Lead', bulk: true }, minute(1));
    const newer = await insertActivity(
      asha,
      'CONTACT_UPDATED',
      { changes: { email: { from: 'a@old.com', to: 'a@new.com' } } },
      minute(5),
    );

    const res = await list(asha);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [
        {
          id: newer,
          contactId: asha,
          type: 'CONTACT_UPDATED',
          payload: { changes: { email: { from: 'a@old.com', to: 'a@new.com' } } },
          createdAt: minute(5).toISOString(),
        },
        {
          id: older,
          contactId: asha,
          type: 'TAG_ADDED',
          payload: { tagId: 1, tagName: 'Lead', bulk: true },
          createdAt: minute(1).toISOString(),
        },
      ],
    });
  });

  it('breaks ties on created_at by id, newest first', async () => {
    // Same timestamp, as when rows are written in one transaction (now() is fixed per transaction).
    const first = await insertActivity(asha, 'TAG_ADDED', { tagId: 1, tagName: 'A' }, minute(1));
    const second = await insertActivity(asha, 'TAG_ADDED', { tagId: 2, tagName: 'B' }, minute(1));
    const third = await insertActivity(asha, 'TAG_REMOVED', { tagId: 1, tagName: 'A' }, minute(1));

    const res = await list(asha);
    expect(res.body.data.map((a: { id: number }) => a.id)).toEqual([third, second, first]);
  });

  it('returns only that contact’s activity, and [] when there is none', async () => {
    await insertActivity(bob, 'TAG_ADDED', { tagId: 1, tagName: 'Lead' }, minute(1));

    const res = await list(asha);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it('returns the newest 20 by default, and `limit` of them when given', async () => {
    for (let i = 1; i <= 25; i++) {
      await insertActivity(asha, 'TAG_ADDED', { tagId: i, tagName: `Tag ${i}` }, minute(i));
    }

    const byDefault = await list(asha);
    expect(byDefault.body.data).toHaveLength(20);
    expect(byDefault.body.data[0].payload.tagName).toBe('Tag 25');
    expect(byDefault.body.data[19].payload.tagName).toBe('Tag 6');

    const limited = await list(asha, '?limit=3');
    expect(limited.body.data.map((a: { payload: { tagName: string } }) => a.payload.tagName)).toEqual([
      'Tag 25',
      'Tag 24',
      'Tag 23',
    ]);
  });

  it('lists the activity written by real edits and tag changes', async () => {
    const vip = await insertTag('VIP');
    await request(app).patch(`/api/contacts/${asha}`).send({ version: 1, company: 'Acme' });
    await request(app).post(`/api/contacts/${asha}/tags`).send({ tagId: vip });
    await request(app).delete(`/api/contacts/${asha}/tags/${vip}`);

    const res = await list(asha);
    expect(res.body.data.map((a: { type: string; payload: unknown }) => [a.type, a.payload])).toEqual([
      ['TAG_REMOVED', { tagId: vip, tagName: 'VIP' }],
      ['TAG_ADDED', { tagId: vip, tagName: 'VIP' }],
      ['CONTACT_UPDATED', { changes: { company: { from: null, to: 'Acme' } } }],
    ]);
  });

  it('404s for a contact that does not exist', async () => {
    const res = await list(999999);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { contactId: 999999 } });
  });

  it.each([
    ['limit 0', '?limit=0'],
    ['limit over 50', '?limit=51'],
    ['a non-numeric limit', '?limit=abc'],
    ['a decimal limit', '?limit=1.5'],
    ['an unknown param', '?page=2'],
  ])('400s for %s', async (_label, query) => {
    const res = await list(asha, query);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400s for a malformed contact id', async () => {
    expect((await list('abc')).status).toBe(400);
  });
});
