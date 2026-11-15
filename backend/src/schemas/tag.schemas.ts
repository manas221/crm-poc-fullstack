import { z } from 'zod';

// No params today; .strict() keeps it consistent with the other list endpoints.
export const listTagsQuerySchema = z.object({}).strict();
