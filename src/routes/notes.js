import { Router } from 'express';
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { notes } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { from, to } = req.query;
  const userId = req.user.id;

  try {
    const conditions = [eq(notes.user_id, userId)];
    if (from) conditions.push(gte(notes.date, from));
    if (to) conditions.push(lte(notes.date, to));

    const rows = await db.select().from(notes).where(and(...conditions));
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const parsed = createNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const [note] = await db
      .insert(notes)
      .values({ ...parsed.data, user_id: req.user.id })
      .returning();
    return res.status(201).json(note);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const parsed = updateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const [note] = await db
      .update(notes)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(notes.id, req.params.id), eq(notes.user_id, req.user.id)))
      .returning();

    if (!note) return res.status(404).json({ error: 'Note not found' });
    return res.json(note);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [note] = await db
      .delete(notes)
      .where(and(eq(notes.id, req.params.id), eq(notes.user_id, req.user.id)))
      .returning();

    if (!note) return res.status(404).json({ error: 'Note not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
