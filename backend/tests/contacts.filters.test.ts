import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const day = (n: number) => new Date(Date.UTC(2025, 0, n, 12, 0, 0));

// created_at follows insertion order, so sort=createdAt&order=asc lists them a, b, c, d, e.
//  - "Acme" / "ACME" are one company; "Acme Corp" is a different one.
//  - Dave's email contains "e_s" literally. Read as a wildcard, "e_s" would also match the
//    "e S" in "Eve Stone", so the escaping test can tell the difference.
const ids: Record<string, number> = {};
const tag: Record<string, number> = {};

beforeAll(async () => {
  await resetDatabase();
  tag.vip = await insertTag('VIP');
  tag.lead = await insertTag('Lead');
  tag.customer = await insertTag('Customer');

  ids.a = await insertContact(
    { firstName: 'Asha', lastName: 'Verma', email: 'asha@acme.com', phone: '+91 98765 43210', company: 'Acme', createdAt: day(1) },
    [tag.vip, tag.lead],
  );
  ids.b = await insertContact(
    { firstName: 'Bob', lastName: 'Stone', email: 'bob@beta.io', phone: '(555) 010-2000', company: 'ACME', createdAt: day(2) },
    [tag.lead],
  );
  ids.c = await insertContact(
    { firstName: 'Carla', lastName: 'Ashworth', email: 'carla@gamma.dev', company: 'Acme Corp', createdAt: day(3) },
    [tag.customer],
  );
  ids.d = await insertContact({ firstName: 'Dave', lastName: 'Patel', email: 'dave_s@zeta.com', createdAt: day(4) });
  ids.e = await insertContact({ firstName: 'Eve', lastName: 'Stone', createdAt: day(5) });
});

const idsOf = (body: { data: { id: number }[] }) => body.data.map((c) => c.id);

async function list(qs: string) {
  const res = await request(app).get(`/api/contacts?sort=createdAt&order=asc&${qs}`);
  expect(res.status).toBe(200);
  return res.body;
}

async function expectIds(qs: string, expected: string[]) {
  const body = await list(qs);
  expect(idsOf(body)).toEqual(expected.map((l) => ids[l]));
  expect(body.pagination.total).toBe(expected.length);
}

describe('GET /api/contacts search (q)', () => {
  it.each([
    ['asha', ['a']],
    ['ash', ['a', 'c']], // Asha, Ashworth
    ['SHA VER', ['a']], // case-insensitive, across first and last name
    ['asha   verma', ['a']], // inner whitespace collapsed
    ['beta.io', ['b']], // email
    ['98765 432', ['a']], // phone, formatting ignored
    ['(555) 010', ['b']],
    ['+91-98765', ['a']],
    ['stone', ['b', 'e']],
  ])('q=%s', async (q, expected) => {
    await expectIds(`q=${encodeURIComponent(q)}`, expected);
  });

  it('does not search phones with the digits of mixed text', async () => {
    // "10" appears in Asha's and Bob's phones, but "Stone 10" is a name search, not a phone one.
    await expectIds(`q=${encodeURIComponent('Stone 10')}`, []);
  });

  it.each([
    ['e_s', ['d']],
    ['a%e', []],
  ])('treats LIKE wildcards in q=%s literally', async (q, expected) => {
    await expectIds(`q=${encodeURIComponent(q)}`, expected);
  });

  it('treats a blank q as no search', async () => {
    await expectIds('q=%20%20', ['a', 'b', 'c', 'd', 'e']);
  });
});

describe('GET /api/contacts company filter', () => {
  it.each([
    ['acme', ['a', 'b']], // exact, case-insensitive: not "Acme Corp"
    ['  ACME ', ['a', 'b']],
    ['Acme Corp', ['c']],
    ['Acm', []], // not a prefix match
  ])('company=%s', async (company, expected) => {
    await expectIds(`company=${encodeURIComponent(company)}`, expected);
  });
});

describe('GET /api/contacts tags filter', () => {
  it('matches contacts with any of the tags', async () => {
    await expectIds(`tags=${tag.vip}`, ['a']);
    await expectIds(`tags=${tag.lead}`, ['a', 'b']);
    await expectIds(`tags=${tag.vip},${tag.customer}`, ['a', 'c']);
  });

  it('lists a contact once even when several of its tags match', async () => {
    await expectIds(`tags=${tag.vip},${tag.lead},${tag.vip}`, ['a', 'b']);
  });

  it('returns all of a contact’s tags, not only the matched one', async () => {
    const body = await list(`tags=${tag.vip}`);
    expect(body.data[0].tags).toEqual([
      { id: tag.lead, name: 'Lead' },
      { id: tag.vip, name: 'VIP' },
    ]);
  });

  it('returns nothing for a tag id that does not exist', async () => {
    await expectIds('tags=9999', []);
  });
});

describe('GET /api/contacts combined filters', () => {
  it('ANDs the filters together', async () => {
    await expectIds('q=ash&company=acme', ['a']); // Ashworth is at Acme Corp
    await expectIds(`q=stone&tags=${tag.lead}`, ['b']); // Eve Stone has no tags
    await expectIds(`company=acme&tags=${tag.customer}`, []);
  });

  it('paginates and counts the filtered set', async () => {
    const body = await list(`tags=${tag.lead}&limit=1&page=2`);
    expect(idsOf(body)).toEqual([ids.b]);
    expect(body.pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
  });

  it('sorts the filtered set', async () => {
    const res = await request(app).get('/api/contacts?q=stone&sort=name&order=desc');
    expect(idsOf(res.body)).toEqual([ids.e, ids.b]);
  });
});

describe('GET /api/contacts invalid filters', () => {
  it.each([
    ['q=a', 'q'],
    [`q=${'a'.repeat(101)}`, 'q'],
    [`company=${'a'.repeat(201)}`, 'company'],
    ['tags=abc', 'tags'],
    ['tags=0', 'tags'],
    ['tags=-1', 'tags'],
    ['tags=1.5', 'tags'],
    ['tags=2,,5', 'tags'],
    ['tags=1&tags=2', 'tags'],
    [`tags=${Array.from({ length: 51 }, (_, i) => i + 1).join(',')}`, 'tags'],
  ])('%s → 400 with a field error on %s', async (qs, field) => {
    const res = await request(app).get(`/api/contacts?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.fieldErrors).toHaveProperty(field);
  });
});
