import { sql } from 'kysely';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import { insertContact, insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();

const day = (n: number) => new Date(Date.UTC(2025, 0, n, 12, 0, 0));

// Fixtures are built to contain ties on purpose:
//  - c3, c4, c5 share the exact same created_at
//  - c1, c4, c5 are all "asha verma" once lowercased (c4 is lowercase)
//  - c2 "bob" is lowercase, so a case-sensitive sort would wrongly put it after "Carl"
// With id as the final key every order is fully determined, so the expected arrays are exact.
const ids: Record<string, number> = {};
let vip: number;
let lead: number;

beforeAll(async () => {
  await resetDatabase();
  vip = await insertTag('VIP');
  lead = await insertTag('Lead');
  const customer = await insertTag('Customer');

  ids.c1 = await insertContact(
    { firstName: 'Asha', lastName: 'Verma', email: 'asha@acme.com', phone: '+91 98765 43210', company: 'Acme', createdAt: day(1), updatedAt: day(1) },
    [vip, lead],
  );
  ids.c2 = await insertContact({ firstName: 'bob', lastName: 'Stone', createdAt: day(2), updatedAt: day(2) });
  ids.c3 = await insertContact({ firstName: 'Carl', lastName: 'Diaz', createdAt: day(3), updatedAt: day(3) }, [customer]);
  ids.c4 = await insertContact({ firstName: 'asha', lastName: 'verma', createdAt: day(3), updatedAt: day(3) });
  ids.c5 = await insertContact({ firstName: 'Asha', lastName: 'Verma', createdAt: day(3), updatedAt: day(3) }, [vip]);
  ids.c6 = await insertContact({ firstName: 'Dana', lastName: 'Kim', createdAt: day(5), updatedAt: day(5) });
  ids.c7 = await insertContact({ firstName: 'Eve', lastName: 'Ng', createdAt: day(6), updatedAt: day(6) });

  // Without this, tied rows sit on disk in id order and Postgres tends to return them in
  // that order anyway, so a missing id tie-breaker would go unnoticed. An UPDATE writes a
  // new row version at the end of the heap: c1 and c3 now come *after* the rest of their
  // tie groups physically, while the expected (id-ordered) results put them first.
  await sql`UPDATE contacts SET updated_at = updated_at WHERE id IN (${ids.c1}, ${ids.c3})`.execute(db);
  // Without stats the planner assumes a bigger table and reads through the sort index,
  // which already orders ties by id and so hides the bug. With real stats it seq-scans and
  // sorts, the path where a missing tie-breaker actually shows.
  await sql`ANALYZE contacts`.execute(db);
});

const order = (...labels: string[]) => labels.map((l) => ids[l]);
const idsOf = (body: { data: { id: number }[] }) => body.data.map((c) => c.id);

describe('GET /api/contacts', () => {
  it('defaults to page 1, limit 25, newest first', async () => {
    const res = await request(app).get('/api/contacts');

    expect(res.status).toBe(200);
    expect(idsOf(res.body)).toEqual(order('c7', 'c6', 'c5', 'c4', 'c3', 'c2', 'c1'));
    expect(res.body.pagination).toEqual({ page: 1, limit: 25, total: 7, totalPages: 1 });
  });

  it('returns the Contact DTO with tags attached and no internal columns', async () => {
    const res = await request(app).get('/api/contacts?sort=createdAt&order=asc&limit=1');

    expect(res.body.data[0]).toEqual({
      id: ids.c1,
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
      createdAt: day(1).toISOString(),
      updatedAt: day(1).toISOString(),
    });
  });

  it('returns an empty tags array for contacts without tags', async () => {
    const res = await request(app).get('/api/contacts');
    const eve = res.body.data.find((c: { id: number }) => c.id === ids.c7);
    expect(eve.tags).toEqual([]);
  });

  describe('sorting', () => {
    it.each([
      ['createdAt', 'asc', ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']],
      ['createdAt', 'desc', ['c7', 'c6', 'c5', 'c4', 'c3', 'c2', 'c1']],
      // Case-insensitive by first name, then last name, then id.
      ['name', 'asc', ['c1', 'c4', 'c5', 'c2', 'c3', 'c6', 'c7']],
      ['name', 'desc', ['c7', 'c6', 'c3', 'c2', 'c5', 'c4', 'c1']],
    ])('sort=%s order=%s', async (sort, dir, expected) => {
      const res = await request(app).get(`/api/contacts?sort=${sort}&order=${dir}`);
      expect(res.status).toBe(200);
      expect(idsOf(res.body)).toEqual(order(...expected));
    });
  });

  describe('pagination', () => {
    it('computes total pages and returns a partial last page', async () => {
      const page3 = await request(app).get('/api/contacts?limit=3&page=3');
      expect(page3.body.pagination).toEqual({ page: 3, limit: 3, total: 7, totalPages: 3 });
      expect(idsOf(page3.body)).toEqual(order('c1'));
    });

    it('returns empty data with the real total for a page past the end', async () => {
      const res = await request(app).get('/api/contacts?limit=3&page=4');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toEqual({ page: 4, limit: 3, total: 7, totalPages: 3 });
    });

    // Pages of 2 split the tied groups (c3/c4/c5 by date, c1/c4/c5 by name) across page
    // boundaries: without the id tie-breaker rows could repeat or go missing.
    it.each([
      ['createdAt', 'asc'],
      ['createdAt', 'desc'],
      ['name', 'asc'],
      ['name', 'desc'],
    ])('walking every page of sort=%s order=%s returns each contact exactly once, in order', async (sort, dir) => {
      const full = await request(app).get(`/api/contacts?sort=${sort}&order=${dir}`);
      const walked: number[] = [];
      for (let page = 1; page <= 4; page++) {
        const res = await request(app).get(`/api/contacts?sort=${sort}&order=${dir}&limit=2&page=${page}`);
        walked.push(...idsOf(res.body));
      }
      expect(walked).toEqual(idsOf(full.body));
      expect(new Set(walked).size).toBe(7);
    });
  });

  describe('invalid query params', () => {
    it.each([
      ['page=0', 'page'],
      ['page=abc', 'page'],
      ['page=1.5', 'page'],
      ['page=1&page=2', 'page'],
      ['limit=0', 'limit'],
      ['limit=101', 'limit'],
      ['sort=email', 'sort'],
      [`sort=${encodeURIComponent('created_at; DROP TABLE contacts')}`, 'sort'],
      ['order=sideways', 'order'],
    ])('%s → 400 with a field error on %s', async (qs, field) => {
      const res = await request(app).get(`/api/contacts?${qs}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.fieldErrors).toHaveProperty(field);
    });

    it('rejects unknown params', async () => {
      const res = await request(app).get('/api/contacts?sortt=name');
      expect(res.status).toBe(400);
      expect(res.body.error.details.formErrors).toEqual(['Unrecognized key: "sortt"']);
    });
  });
});
