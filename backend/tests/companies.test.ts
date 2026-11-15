import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { insertContact, resetDatabase } from './helpers/db.js';

const app = createApp();

// "Acme"/"acme" are one company spelt two ways. "100%_Pure" contains both LIKE wildcards.
// "Pacman Corp" contains "acm" but doesn't start with it. "Beta Labs" contains "labs" and sorts
// before "Labsmith", which starts with it, so prefix-first order is actually tested (with
// "acm" alone, alphabetical order would pass by accident). Two contacts have no company.
beforeAll(async () => {
  await resetDatabase();
  const companies = ['Acme', 'acme', 'Acme', 'Pacman Corp', 'Beta Labs', 'Labsmith', '100%_Pure', 'Zeta', null, null];
  for (const [i, company] of companies.entries()) {
    await insertContact({ firstName: `F${i}`, lastName: `L${i}`, company });
  }
});

const names = (body: { data: { name: string }[] }) => body.data.map((c) => c.name);

describe('GET /api/companies', () => {
  it('lists distinct companies alphabetically, merging case variants and skipping nulls', async () => {
    const res = await request(app).get('/api/companies');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [{ name: '100%_Pure' }, { name: 'Acme' }, { name: 'Beta Labs' }, { name: 'Labsmith' }, { name: 'Pacman Corp' }, { name: 'Zeta' }],
    });
  });

  it('matches anywhere in the name, case-insensitively, with prefix matches first', async () => {
    for (const q of ['acm', 'ACM', '  acm  ']) {
      const res = await request(app).get(`/api/companies?q=${encodeURIComponent(q)}`);
      expect(names(res.body)).toEqual(['Acme', 'Pacman Corp']);
    }
    const labs = await request(app).get('/api/companies?q=labs');
    expect(names(labs.body)).toEqual(['Labsmith', 'Beta Labs']);
  });

  it.each(['%', '_'])('treats %s in the query as a literal character, not a wildcard', async (q) => {
    const res = await request(app).get(`/api/companies?q=${encodeURIComponent(q)}`);
    expect(names(res.body)).toEqual(['100%_Pure']);
  });

  it('treats an empty or blank q as no filter', async () => {
    const res = await request(app).get('/api/companies?q=%20%20');
    expect(names(res.body)).toHaveLength(6);
  });

  it('returns an empty list when nothing matches', async () => {
    const res = await request(app).get('/api/companies?q=zzz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it('respects limit', async () => {
    const res = await request(app).get('/api/companies?limit=2');
    expect(names(res.body)).toEqual(['100%_Pure', 'Acme']);
  });

  it.each([
    [`q=${'a'.repeat(101)}`, 'q'],
    ['limit=0', 'limit'],
    ['limit=51', 'limit'],
    ['limit=abc', 'limit'],
  ])('%s → 400 with a field error on %s', async (qs, field) => {
    const res = await request(app).get(`/api/companies?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.fieldErrors).toHaveProperty(field);
  });

  it('rejects unknown params', async () => {
    const res = await request(app).get('/api/companies?company=Acme');
    expect(res.status).toBe(400);
  });
});
