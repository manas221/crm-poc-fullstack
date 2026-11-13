/**
 * Seeds demo data.
 *
 *   npm run seed -- --reset                 # wipe all tables, then insert
 *   SEED_COUNT=50000 npm run seed -- --reset
 *
 * Without --reset the script refuses to run on a non-empty database, so it can't pile
 * duplicate data on top of real edits. Everything runs in one transaction: a failed
 * seed leaves the database as it was.
 */
import { faker } from '@faker-js/faker';
import { sql, type Insertable, type Transaction } from 'kysely';
import { z } from 'zod';
import { config } from '../config.js';
import { db } from './client.js';
import type { ContactsTable, Database } from './types.js';

const BATCH_SIZE = 1_000;
const COMPANY_COUNT = 200;
const TAG_NAMES = ['Lead', 'Customer', 'VIP', 'Prospect', 'Partner', 'Churned'] as const;
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

const seedCount = z.coerce
  .number()
  .int()
  .min(1)
  .max(1_000_000)
  .default(5_000)
  .parse(process.env.SEED_COUNT);
const reset = process.argv.includes('--reset');

/** "D'Amore-Smith" → "damoresmith", safe for the local part of an email. */
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Phone numbers in a few realistic formats, all matching the API's phone validation. */
function fakePhone(): string {
  const d = (n: number) => faker.string.numeric(n);
  return faker.helpers.arrayElement([
    () => `+1 (${d(3)}) ${d(3)}-${d(4)}`,
    () => `+91 ${d(5)} ${d(5)}`,
    () => `+44 20 ${d(4)} ${d(4)}`,
    () => `(${d(3)}) ${d(3)}-${d(4)}`,
  ])();
}

function uniqueCompanies(count: number): string[] {
  const names = new Set<string>();
  while (names.size < count) {
    names.add(faker.company.name());
  }
  return [...names];
}

function fakeContact(index: number, companies: string[], now: number): Insertable<ContactsTable> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const company = faker.datatype.boolean({ probability: 0.05 }) ? null : faker.helpers.arrayElement(companies);
  const domain = company ? `${slug(company)}.com` : faker.helpers.arrayElement(['gmail.com', 'outlook.com', 'yahoo.com']);
  // The index suffix guarantees uniqueness across the whole seed.
  const email = faker.datatype.boolean({ probability: 0.1 })
    ? null
    : `${slug(firstName)}.${slug(lastName)}${index}@${domain}`;
  const phone = faker.datatype.boolean({ probability: 0.1 }) ? null : fakePhone();
  const createdAt = faker.date.between({ from: now - TWO_YEARS_MS, to: now });

  return { firstName, lastName, email, phone, company, createdAt, updatedAt: createdAt };
}

async function assertEmptyOrReset(trx: Transaction<Database>): Promise<void> {
  if (reset) {
    await sql`TRUNCATE contact_activities, contact_tags, tags, contacts RESTART IDENTITY CASCADE`.execute(trx);
    return;
  }
  const { count } = await trx
    .selectFrom('contacts')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow();
  if (count > 0) {
    throw new Error(`Database already has ${count} contacts. Re-run with --reset to wipe and reseed.`);
  }
}

async function seed(trx: Transaction<Database>): Promise<{ contacts: number; links: number }> {
  await assertEmptyOrReset(trx);

  const tags = await trx
    .insertInto('tags')
    .values(TAG_NAMES.map((name) => ({ name })))
    .returning(['id', 'name'])
    .execute();
  const tagIds = tags.map((t) => t.id);

  const companies = uniqueCompanies(COMPANY_COUNT);
  const now = Date.now();
  let links = 0;

  for (let start = 0; start < seedCount; start += BATCH_SIZE) {
    const size = Math.min(BATCH_SIZE, seedCount - start);
    const rows = Array.from({ length: size }, (_, i) => fakeContact(start + i + 1, companies, now));
    const inserted = await trx.insertInto('contacts').values(rows).returning('id').execute();

    const contactTags = inserted.flatMap(({ id }) =>
      faker.helpers.arrayElements(tagIds, { min: 0, max: 3 }).map((tagId) => ({ contactId: id, tagId })),
    );
    if (contactTags.length > 0) {
      await trx.insertInto('contactTags').values(contactTags).execute();
      links += contactTags.length;
    }

    console.log(`  ${start + size} / ${seedCount} contacts`);
  }

  return { contacts: seedCount, links };
}

async function main(): Promise<void> {
  const target = new URL(config.databaseUrl);
  console.log(`Seeding ${target.host}${target.pathname} with ${seedCount} contacts${reset ? ' (reset)' : ''}`);

  faker.seed(42);
  const startedAt = Date.now();
  const result = await db.transaction().execute(seed);

  console.log(
    `Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s: ` +
      `${result.contacts} contacts, ${TAG_NAMES.length} tags, ${result.links} contact-tag links.`,
  );
}

try {
  await main();
} catch (err) {
  console.error('Seed failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await db.destroy();
}
