import { Router, Request, Response } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/auth/users - Get all users (for mock auth selector)
router.get('/users', (_req: Request, res: Response) => {
  const allUsers = db.users.getAll();
  const enriched = allUsers.map(u => {
    const hospital = u.hospital_id ? db.hospitals.getById(u.hospital_id) : null;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      hospitalId: u.hospital_id,
      hospitalName: hospital?.name || null,
    };
  });
  res.json(enriched);
});

// POST /api/auth/login - Mock login
router.post('/login', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.users.getById(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const hospital = user.hospital_id ? db.hospitals.getById(user.hospital_id) : null;
  
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hospitalId: user.hospital_id,
    hospitalName: hospital?.name || null,
  });
});

// GET /api/auth/hospitals - Get all hospitals
router.get('/hospitals', (_req: Request, res: Response) => {
  res.json(db.hospitals.getAll());
});

export default router;
