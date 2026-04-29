import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ user: data.user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user,
  });
});

router.post('/logout', requireAuth, async (req, res) => {
  const token = req.headers.authorization.slice(7);
  await supabase.auth.admin.signOut(token);
  return res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase.auth.admin.getUserById(req.user.id);
  if (error) return res.status(404).json({ error: error.message });
  return res.json({ user: data.user });
});

export default router;
