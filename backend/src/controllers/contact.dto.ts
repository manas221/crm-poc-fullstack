import type { ContactWithTags, Tag } from '../services/contact.service.js';

/** The Contact shape the API returns (CLAUDE.md §6). The frontend copies this type. */
export interface ContactDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: Tag[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export function toContactDto(contact: ContactWithTags): ContactDto {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    tags: contact.tags,
    version: contact.version,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}
