import { z } from 'zod';

const NOTE_TYPES = ['sticky', 'pink', 'lavender', 'lined', 'grid', 'todo'];

const todoItem = z.object({
  text: z.string(),
  done: z.boolean(),
});

export const createNoteSchema = z.object({
  type: z.enum(NOTE_TYPES),
  title: z.string().optional(),
  body: z.string().optional(),
  items: z.array(todoItem).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'time must be HH:MM or HH:MM:SS').optional(),
});

export const updateNoteSchema = createNoteSchema.partial();
