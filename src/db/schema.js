import { pgTable, uuid, text, jsonb, date, time, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull(),
  type: text('type').notNull(), // sticky, pink, lavender, lined, grid, todo
  title: text('title'),
  body: text('body'),
  items: jsonb('items'), // [{text, done}] for todo type
  date: date('date').notNull(),
  time: time('time'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
