import { notFound } from '../errors/app-error.js';
import * as activityRepository from '../repositories/activity.repository.js';
import type { ActivityRow } from '../repositories/activity.repository.js';
import * as contactRepository from '../repositories/contact.repository.js';

export type { ActivityRow };

/**
 * A contact's most recent activity, newest first. A missing contact is a 404 rather than an
 * empty list, so the client can tell "no such contact" from "nothing has happened yet".
 */
export async function listRecentActivities(contactId: number, limit: number): Promise<ActivityRow[]> {
  const [contact, activities] = await Promise.all([
    contactRepository.findById(contactId),
    activityRepository.findRecentByContactId(contactId, limit),
  ]);
  if (!contact) {
    throw notFound('Contact not found', { contactId });
  }
  return activities;
}
