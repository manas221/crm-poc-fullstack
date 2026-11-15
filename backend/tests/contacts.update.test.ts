import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const OLD = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));

let asha: number;
let rohan: number;
let vip: number;

beforeEach(async () => {
  await resetDatabase();
  vip = await insertTag('VIP');
  asha = await insertContact(
    {
      firstName: 'Asha',
      lastName: 'Verma',
      email: 'asha@acme.com',
      phone: '+91 98765 43210',
      company: 'Acme',
      createdAt: OLD,
      updatedAt: OLD,
    },
    [vip],
  );
  rohan = await insertContact({ firstName: 'Rohan', lastName: 'Mehta', email: 'rohan@globex.io' });
});

const patch = (id: number | string, body: unknown) =>
  request(app)
    .patch(`/api/contacts/${id}`)
    .send(body as object);

const row = (id: number) =>
  db
    .selectFrom('contacts')
    .select(['firstName', 'lastName', 'email', 'phone', 'company', 'version', 'updatedAt'])
    .where('id', '=', id)
    .executeTakeFirstOrThrow();

const activities = () =>
  db.selectFrom('contactActivities').select(['contactId', 'type', 'payload']).orderBy('id').execute();

describe('PATCH /api/contacts/:id', () => {
  it('updates with the current version: bumps it, and logs only the fields that changed', async () => {
    const res = await patch(asha, { version: 1, phone: '+91 90000 11111', company: 'Acme', lastName: 'Verma' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: asha,
      firstName: 'Asha',
      phone: '+91 90000 11111',
      company: 'Acme',
      version: 2,
      tags: [{ id: vip, name: 'VIP' }],
    });
    const saved = await row(asha);
    expect(saved.version).toBe(2);
    expect(saved.phone).toBe('+91 90000 11111');
    expect(saved.updatedAt.getTime()).toBeGreaterThan(OLD.getTime());
    // company and lastName were sent unchanged, so they aren't in the diff.
    expect(await activities()).toEqual([
      {
        contactId: asha,
        type: 'CONTACT_UPDATED',
        payload: { changes: { phone: { from: '+91 98765 43210', to: '+91 90000 11111' } } },
      },
    ]);
  });

  it('409s on a stale version, with the current contact, and changes nothing', async () => {
    expect((await patch(asha, { version: 1, company: 'Acme Corp' })).status).toBe(200); // now version 2

    const res = await patch(asha, { version: 1, phone: '+91 90000 11111' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({
      code: 'VERSION_CONFLICT',
      details: { current: { id: asha, company: 'Acme Corp', phone: '+91 98765 43210', version: 2 } },
    });
    expect(res.body.error.details.current.tags).toEqual([{ id: vip, name: 'VIP' }]);
    const saved = await row(asha);
    expect(saved).toMatchObject({ phone: '+91 98765 43210', version: 2 });
    expect(await activities()).toHaveLength(1); // only the first, successful edit
  });

  it('lets exactly one of two concurrent edits with the same version win', async () => {
    const [a, b] = await Promise.all([
      patch(asha, { version: 1, company: 'From A' }),
      patch(asha, { version: 1, company: 'From B' }),
    ]);

    expect([a.status, b.status].sort()).toEqual([200, 409]);
    const winner = a.status === 200 ? 'From A' : 'From B';
    expect(await row(asha)).toMatchObject({ company: winner, version: 2 });
    expect(await activities()).toHaveLength(1);
  });

  it.each(['rohan@globex.io', 'ROHAN@Globex.IO', '  rohan@globex.io  '])(
    '409s EMAIL_TAKEN when another contact has the email (%s), and changes nothing',
    async (email) => {
      const res = await patch(asha, { version: 1, email, company: 'New Co' });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatchObject({ code: 'EMAIL_TAKEN', details: { field: 'email' } });
      expect(await row(asha)).toMatchObject({ email: 'asha@acme.com', company: 'Acme', version: 1 });
      expect(await activities()).toEqual([]);
    },
  );

  it('returns the contact unchanged, without a version bump or activity, when nothing changes', async () => {
    // Same values, written differently: whitespace and email case are normalised first.
    const res = await patch(asha, { version: 1, firstName: ' Asha ', email: 'ASHA@acme.com' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ version: 1, email: 'asha@acme.com' });
    expect((await row(asha)).updatedAt.getTime()).toBe(OLD.getTime());
    expect(await activities()).toEqual([]);
  });

  it('trims names, lowercases email, and stores blanks as null', async () => {
    const res = await patch(asha, {
      version: 1,
      firstName: '  Asha  ',
      lastName: ' Rao ',
      email: '  Asha.Rao@Acme.COM ',
      phone: '   ',
      company: '',
    });

    expect(res.status).toBe(200);
    expect(await row(asha)).toMatchObject({
      firstName: 'Asha',
      lastName: 'Rao',
      email: 'asha.rao@acme.com',
      phone: null,
      company: null,
      version: 2,
    });
    const [activity] = await activities();
    expect(Object.keys((activity?.payload as { changes: object }).changes).sort()).toEqual([
      'company',
      'email',
      'lastName',
      'phone',
    ]);
  });

  it('allows several contacts without an email (unique only when present)', async () => {
    expect((await patch(rohan, { version: 1, email: null })).status).toBe(200);
    expect((await patch(asha, { version: 1, email: null })).status).toBe(200);
    expect((await row(asha)).email).toBeNull();
  });

  it('404s for a contact that does not exist', async () => {
    const res = await patch(999999, { version: 1, company: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { contactId: 999999 } });
  });

  it.each([
    ['no version', { company: 'X' }],
    ['version as a string', { version: '1', company: 'X' }],
    ['version 0', { version: 0, company: 'X' }],
    ['only the version', { version: 1 }],
    ['an unknown field', { version: 1, company: 'X', nickname: 'A' }],
    ['trying to set the id', { version: 1, id: 5 }],
    ['an empty first name', { version: 1, firstName: '   ' }],
    ['a null last name', { version: 1, lastName: null }],
    ['a name over 100 characters', { version: 1, firstName: 'a'.repeat(101) }],
    ['an invalid email', { version: 1, email: 'asha@acme' }],
    ['an email that is not a string', { version: 1, email: 5 }],
    ['a phone with letters', { version: 1, phone: '98765 ABCDE' }],
    ['a phone that is too short', { version: 1, phone: '12345' }],
    ['a company over 200 characters', { version: 1, company: 'c'.repeat(201) }],
  ])('400s for %s, and changes nothing', async (_label, body) => {
    const res = await patch(asha, body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(await row(asha)).toMatchObject({ version: 1, company: 'Acme' });
  });

  it('400s for a malformed id', async () => {
    const res = await patch('abc', { version: 1, company: 'X' });
    expect(res.status).toBe(400);
  });
});
