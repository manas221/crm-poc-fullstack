import { sql } from 'kysely';
import { db } from '../db/client.js';
import { escapeLike } from '../utils/like.js';

export interface CompanyRow {
  name: string;
}

/**
 * Companies are derived from contacts.company; there is no companies table (see README).
 * Spellings that differ only by case ("Acme" / "acme") are one company, because the list
 * filter matches company case-insensitively. min(... COLLATE "C") picks one spelling to
 * show, the same one on every database regardless of its default collation.
 */
export async function findCompanies({ q, limit }: { q?: string; limit: number }): Promise<CompanyRow[]> {
  let query = db
    .selectFrom('contacts')
    .select(sql<string>`min(company COLLATE "C")`.as('name'))
    .where('company', 'is not', null)
    .groupBy(sql`lower(company)`);

  if (q) {
    const pattern = escapeLike(q);
    query = query
      .where('company', 'ilike', `%${pattern}%`)
      // Autocomplete: "acm" should list "Acme" before "Pacman Corp".
      .orderBy(sql`bool_or(company ILIKE ${`${pattern}%`})`, 'desc');
  }

  return query.orderBy(sql`lower(company)`).limit(limit).execute();
}
