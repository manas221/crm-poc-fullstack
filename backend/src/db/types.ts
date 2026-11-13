import type { ColumnType, Generated, GeneratedAlways } from 'kysely';

// Kysely table types. Keys are camelCase; CamelCasePlugin maps them to snake_case columns.
//   GeneratedAlways<T>: Postgres computes it (identity / generated columns), never written by us.
//   Generated<T>:       has a DB default, optional on insert.

export type ActivityType = 'CONTACT_UPDATED' | 'TAG_ADDED' | 'TAG_REMOVED';

export interface FieldChange {
  from: string | null;
  to: string | null;
}

export interface ContactUpdatedPayload {
  changes: Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'company', FieldChange>>;
}

export interface TagActivityPayload {
  tagId: number;
  tagName: string;
  bulk?: true;
}

export type ActivityPayload = ContactUpdatedPayload | TagActivityPayload;

export interface ContactsTable {
  id: GeneratedAlways<number>;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  fullName: GeneratedAlways<string>;
  phoneDigits: GeneratedAlways<string>;
  version: Generated<number>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>; // set explicitly to now() in update queries (no trigger)
}

export interface TagsTable {
  id: GeneratedAlways<number>;
  name: string;
  createdAt: Generated<Date>;
}

export interface ContactTagsTable {
  contactId: number;
  tagId: number;
  createdAt: Generated<Date>;
}

export interface ContactActivitiesTable {
  id: GeneratedAlways<number>;
  contactId: number;
  type: ActivityType;
  payload: ColumnType<ActivityPayload, ActivityPayload | undefined, ActivityPayload>;
  createdAt: Generated<Date>;
}

export interface Database {
  contacts: ContactsTable;
  tags: TagsTable;
  contactTags: ContactTagsTable;
  contactActivities: ContactActivitiesTable;
}
