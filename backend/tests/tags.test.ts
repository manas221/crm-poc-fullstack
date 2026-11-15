import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { insertTag, resetDatabase } from './helpers/db.js';

const app = createApp();
const tag: Record<string, number> = {};

beforeAll(async () => {
  await resetDatabase();
  // Inserted out of order, and "lead" is lowercase, so the test checks case-insensitive sorting.
  tag.vip = await insertTag('VIP');
  tag.customer = await insertTag('Customer');
  tag.lead = await insertTag('lead');
});

describe('GET /api/tags', () => {
  it('lists every tag alphabetically, ignoring case', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [
        { id: tag.customer, name: 'Customer' },
        { id: tag.lead, name: 'lead' },
        { id: tag.vip, name: 'VIP' },
      ],
    });
  });

  it('rejects unknown params', async () => {
    const res = await request(app).get('/api/tags?q=v');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
