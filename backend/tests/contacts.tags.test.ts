import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const OLD = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));

let asha: number;
let vip: number;
let lead: number;

beforeEach(async () => {
  await resetDatabase();
  vip = await insertTag('VIP');
  lead = await insertTag('Lead');
  // Asha already has Lead. updated_at starts in the past, so a bump shows.
  asha = await insertContact({ firstName: 'Asha', lastName: 'Verma', createdAt: OLD, updatedAt: OLD }, [lead]);
});

const addTag = (contactId: number | string, body: unknown) =>
  request(app)
    .post(`/api/contacts/${contactId}/tags`)
    .send(body as object);

const removeTag = (contactId: number | string, tagId: number | string) =>
  request(app).delete(`/api/contacts/${contactId}/tags/${tagId}`);

const tagIdsOf = async (contactId: number) =>
  (
    await db.selectFrom('contactTags').select('tagId').where('contactId', '=', contactId).orderBy('tagId').execute()
  ).map((r) => r.tagId);

const contactRow = (id: number) =>
  db.selectFrom('contacts').select(['version', 'updatedAt']).where('id', '=', id).executeTakeFirstOrThrow();

const activities = () =>
  db.selectFrom('contactActivities').select(['contactId', 'type', 'payload']).orderBy('id').execute();

describe('POST /api/contacts/:id/tags', () => {
  it('adds the tag, logs TAG_ADDED, bumps updated_at but not version, and returns the contact', async () => {
    const res = await addTag(asha, { tagId: vip });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: asha,
      version: 1,
      tags: [
        { id: lead, name: 'Lead' },
        { id: vip, name: 'VIP' },
      ],
    });
    expect(await tagIdsOf(asha)).toEqual([vip, lead].sort((a, b) => a - b));
    const row = await contactRow(asha);
    expect(row.version).toBe(1);
    expect(row.updatedAt.getTime()).toBeGreaterThan(OLD.getTime());
    expect(await activities()).toEqual([
      { contactId: asha, type: 'TAG_ADDED', payload: { tagId: vip, tagName: 'VIP' } },
    ]);
  });

  it('is safe to repeat: adding a tag the contact already has writes nothing', async () => {
    const first = await addTag(asha, { tagId: vip });
    const updatedAfterFirst = (await contactRow(asha)).updatedAt;
    const second = await addTag(asha, { tagId: vip });

    expect(second.status).toBe(200);
    expect(second.body.tags).toEqual(first.body.tags);
    expect(await tagIdsOf(asha)).toHaveLength(2);
    expect(await activities()).toHaveLength(1);
    expect((await contactRow(asha)).updatedAt).toEqual(updatedAfterFirst);
  });

  it('writes one link and one activity when the same tag is added twice at once', async () => {
    const results = await Promise.all([addTag(asha, { tagId: vip }), addTag(asha, { tagId: vip })]);

    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(await tagIdsOf(asha)).toHaveLength(2);
    expect((await activities()).filter((a) => a.type === 'TAG_ADDED')).toHaveLength(1);
  });

  it('does not make an open edit conflict (tags skip the version check)', async () => {
    await addTag(asha, { tagId: vip });

    const edit = await request(app).patch(`/api/contacts/${asha}`).send({ version: 1, company: 'Acme' });
    expect(edit.status).toBe(200);
    expect(edit.body.version).toBe(2);
  });

  it('404s for a contact that does not exist', async () => {
    const res = await addTag(999999, { tagId: vip });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { contactId: 999999 } });
  });

  it('404s for a tag that does not exist, and changes nothing', async () => {
    const res = await addTag(asha, { tagId: 999999 });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { tagId: 999999 } });
    expect(await tagIdsOf(asha)).toEqual([lead]);
    expect(await activities()).toEqual([]);
  });

  it.each([
    ['no body', undefined],
    ['no tagId', {}],
    ['tagId as a string', { tagId: '1' }],
    ['tagId 0', { tagId: 0 }],
    ['a decimal tagId', { tagId: 1.5 }],
    ['an unknown field', { tagId: 1, bulk: true }],
  ])('400s for %s', async (_label, body) => {
    const res = await addTag(asha, body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400s for a malformed contact id', async () => {
    expect((await addTag('abc', { tagId: vip })).status).toBe(400);
  });
});

describe('DELETE /api/contacts/:id/tags/:tagId', () => {
  it('removes the tag, logs TAG_REMOVED, bumps updated_at but not version, and returns the contact', async () => {
    const res = await removeTag(asha, lead);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: asha, version: 1, tags: [] });
    expect(await tagIdsOf(asha)).toEqual([]);
    const row = await contactRow(asha);
    expect(row.version).toBe(1);
    expect(row.updatedAt.getTime()).toBeGreaterThan(OLD.getTime());
    expect(await activities()).toEqual([
      { contactId: asha, type: 'TAG_REMOVED', payload: { tagId: lead, tagName: 'Lead' } },
    ]);
  });

  it('is safe to repeat: removing it again writes nothing', async () => {
    await removeTag(asha, lead);
    const updatedAfterFirst = (await contactRow(asha)).updatedAt;
    const second = await removeTag(asha, lead);

    expect(second.status).toBe(200);
    expect(second.body.tags).toEqual([]);
    expect(await activities()).toHaveLength(1);
    expect((await contactRow(asha)).updatedAt).toEqual(updatedAfterFirst);
  });

  it('is a no-op for a tag the contact does not have, or one that does not exist', async () => {
    expect((await removeTag(asha, vip)).status).toBe(200);
    expect((await removeTag(asha, 999999)).status).toBe(200);
    expect(await tagIdsOf(asha)).toEqual([lead]);
    expect(await activities()).toEqual([]);
    expect((await contactRow(asha)).updatedAt.getTime()).toBe(OLD.getTime());
  });

  it('logs add and remove in order when a tag is added back and removed again', async () => {
    await removeTag(asha, lead);
    await addTag(asha, { tagId: lead });
    await removeTag(asha, lead);

    expect((await activities()).map((a) => a.type)).toEqual(['TAG_REMOVED', 'TAG_ADDED', 'TAG_REMOVED']);
  });

  it('404s for a contact that does not exist', async () => {
    const res = await removeTag(999999, lead);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { contactId: 999999 } });
  });

  it.each([
    ['a malformed contact id', 'abc', '1'],
    ['a malformed tag id', null, 'x'],
    ['tag id 0', null, '0'],
  ])('400s for %s', async (_label, contactId, tagId) => {
    const res = await removeTag(contactId ?? asha, tagId);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
