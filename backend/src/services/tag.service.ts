import * as tagRepository from '../repositories/tag.repository.js';
import type { Tag } from '../repositories/tag.repository.js';

export function listTags(): Promise<Tag[]> {
  return tagRepository.findAll();
}
