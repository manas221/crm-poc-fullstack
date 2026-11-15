import type { ActivityPayload, ActivityType } from '../db/types.js';
import type { ActivityRow } from '../services/activity.service.js';

/**
 * An activity entry as the API returns it. The frontend copies this type. `payload` depends on
 * `type` (CLAUDE.md §5):
 * - CONTACT_UPDATED: { changes: { email: { from, to }, … } }, only the fields that changed
 * - TAG_ADDED / TAG_REMOVED: { tagId, tagName }, plus bulk: true for a bulk assignment
 */
export interface ActivityDto {
  id: number;
  contactId: number;
  type: ActivityType;
  payload: ActivityPayload;
  createdAt: string;
}

export function toActivityDto(activity: ActivityRow): ActivityDto {
  return {
    id: activity.id,
    contactId: activity.contactId,
    type: activity.type,
    payload: activity.payload,
    createdAt: activity.createdAt.toISOString(),
  };
}
