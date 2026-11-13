// Copied from the backend contract (backend/src/controllers/contact.dto.ts, CLAUDE.md §6).

export interface Tag {
  id: number;
  name: string;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: Tag[];
  version: number;
  createdAt: string; // ISO 8601, UTC
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactListResponse {
  data: Contact[];
  pagination: Pagination;
}

export interface ListContactsParams {
  page: number;
  limit: number;
}
