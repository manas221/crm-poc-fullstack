import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const CREATED = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
const UPDATED = new Date(Date.UTC(2025, 0, 2, 8, 30, 0));

let asha: number;
let bob: number;
let vip: number;
let lead: number;

beforeAll(async () => {
  await resetDatabase();
  vip = await insertTag('VIP');
  lead = await insertTag('Lead');
  asha = await insertContact(
    {
      firstName: 'Asha',
      lastName: 'Verma',
      email: 'asha@acme.com',
      phone: '+91 98765 43210',
      company: 'Acme',
      createdAt: CREATED,
      updatedAt: UPDATED,
    },
    [vip, lead],
  );
  bob = await insertContact({ firstName: 'Bob', lastName: 'Stone' });
});

describe('GET /api/contacts/:id', () => {
  it('returns the contact DTO with its tags (sorted by name) and version', async () => {
    const res = await request(app).get(`/api/contacts/${asha}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: asha,
      firstName: 'Asha',
      lastName: 'Verma',
      email: 'asha@acme.com',
      phone: '+91 98765 43210',
      company: 'Acme',
      tags: [
        { id: lead, name: 'Lead' },
        { id: vip, name: 'VIP' },
      ],
      version: 1,
      createdAt: CREATED.toISOString(),
      updatedAt: UPDATED.toISOString(),
    });
  });

  it('returns nulls and no tags for a contact without them', async () => {
    const res = await request(app).get(`/api/contacts/${bob}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: bob, email: null, phone: null, company: null, tags: [] });
  });

  it('404s for an id that does not exist', async () => {
    const res = await request(app).get('/api/contacts/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND', details: { contactId: 999999 } });
  });

  it.each(['abc', '0', '-1', '1.5', '1e3', '0x10', '007', String(Number.MAX_SAFE_INTEGER + 2)])(
    '400s for the malformed id %s',
    async (id) => {
      const res = await request(app).get(`/api/contacts/${id}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    },
  );
});
