import { sql, type Kysely } from 'kysely';

// Migrations take Kysely<unknown> on purpose: they must not depend on the current
// Database types, which describe the schema *after* all migrations have run.
// Kysely runs each migration in a transaction on Postgres, so a failure leaves nothing behind.

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);

  // ── contacts ──────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE contacts (
      id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      first_name    text NOT NULL,
      last_name     text NOT NULL,
      email         text,
      phone         text,
      company       text,
      full_name     text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
      phone_digits  text GENERATED ALWAYS AS (regexp_replace(coalesce(phone, ''), '\\D', '', 'g')) STORED,
      version       integer NOT NULL DEFAULT 1,
      created_at    timestamptz NOT NULL DEFAULT now(),
      updated_at    timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  // Email is unique only when present, ignoring case.
  await sql`CREATE UNIQUE INDEX contacts_email_unique ON contacts (lower(email)) WHERE email IS NOT NULL`.execute(db);

  // Search: ILIKE '%term%' needs trigram indexes (a B-tree can't serve a leading wildcard).
  await sql`CREATE INDEX contacts_full_name_trgm ON contacts USING gin (full_name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX contacts_email_trgm ON contacts USING gin (email gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX contacts_phone_digits_trgm ON contacts USING gin (phone_digits gin_trgm_ops)`.execute(db);

  // Sorting, always with id as the tie-breaker so pages are stable.
  await sql`CREATE INDEX contacts_created_at_id ON contacts (created_at, id)`.execute(db);
  await sql`CREATE INDEX contacts_name_sort ON contacts (lower(first_name), lower(last_name), id)`.execute(db);

  // Filtering by company (exact, case-insensitive).
  await sql`CREATE INDEX contacts_company ON contacts (lower(company))`.execute(db);

  // ── tags ──────────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE tags (
      id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name        text NOT NULL,
      created_at  timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);
  await sql`CREATE UNIQUE INDEX tags_name_unique ON tags (lower(name))`.execute(db);

  // ── contact_tags (many-to-many) ───────────────────────────────────────────
  await sql`
    CREATE TABLE contact_tags (
      contact_id  bigint NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      tag_id      bigint NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at  timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (contact_id, tag_id)
    )
  `.execute(db);
  // The PK covers lookups by contact_id; this one serves the tag filter (by tag_id).
  await sql`CREATE INDEX contact_tags_tag_contact ON contact_tags (tag_id, contact_id)`.execute(db);

  // ── contact_activities ────────────────────────────────────────────────────
  // No FK to tags on purpose: tag id/name are copied into payload so history survives renames.
  await sql`
    CREATE TABLE contact_activities (
      id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      contact_id  bigint NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      type        text NOT NULL CHECK (type IN ('CONTACT_UPDATED', 'TAG_ADDED', 'TAG_REMOVED')),
      payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at  timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);
  await sql`CREATE INDEX contact_activities_contact_created ON contact_activities (contact_id, created_at DESC)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TABLE IF EXISTS contact_activities`.execute(db);
  await sql`DROP TABLE IF EXISTS contact_tags`.execute(db);
  await sql`DROP TABLE IF EXISTS tags`.execute(db);
  await sql`DROP TABLE IF EXISTS contacts`.execute(db);
  // pg_trgm is left installed: dropping an extension is rarely what a rollback wants.
}
