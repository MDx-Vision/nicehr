import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import websocketService from '../services/websocket.js';

const router = Router();

// GET /api/consultants/available - List available consultants
router.get('/available', (_req: Request, res: Response) => {
  const availableList = db.availability.getAvailable();
  
  const enriched = availableList.map(avail => {
    const user = db.users.getById(avail.consultant_id);
    const specs = db.specialties.getByConsultantId(avail.consultant_id);
    
    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      status: avail.status,
      sessionsToday: avail.sessions_today,
      specialties: specs.map(s => ({ department: s.department, proficiency: s.proficiency })),
    };
  });

  res.json(enriched);
});

// GET /api/consultants - List all consultants with status
router.get('/', (_req: Request, res: Response) => {
  const consultants = db.users.getByRole('consultant');
  
  const enriched = consultants.map(user => {
    const avail = db.availability.getByConsultantId(user.id);
    const specs = db.specialties.getByConsultantId(user.id);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: avail?.status || 'offline',
      sessionsToday: avail?.sessions_today || 0,
      lastSeenAt: avail?.last_seen_at,
      specialties: specs.map(s => ({ department: s.department, proficiency: s.proficiency })),
    };
  });

  res.json(enriched);
});

// POST /api/consultants/status - Update consultant status
router.post('/status', (req: Request, res: Response) => {
  const { consultantId, status } = req.body;

  const validStatuses = ['online', 'available', 'busy', 'away', 'offline'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Check if consultant has an active session
  if (['available', 'away', 'offline'].includes(status)) {
    const activeSession = db.sessions.getActive(consultantId);
    if (activeSession && activeSession.consultant_id === consultantId) {
      return res.status(400).json({ error: 'Cannot change status while in an active session' });
    }
  }

  const existing = db.availability.getByConsultantId(consultantId);
  if (existing) {
    db.availability.update(consultantId, { status: status as any });
  } else {
    db.availability.insert({ consultant_id: consultantId, status: status as any });
  }

  // Get consultant name for broadcast
  const consultant = db.users.getById(consultantId);

  // Broadcast status change to all clients
  websocketService.broadcast('consultant_status_changed', {
    consultantId,
    consultantName: consultant?.name,
    status,
  });

  res.json({ success: true, status });
});

// GET /api/consultants/:id/specialties - Get consultant's specialties
router.get('/:id/specialties', (req: Request, res: Response) => {
  const consultantId = parseInt(req.params.id);
  const specs = db.specialties.getByConsultantId(consultantId);
  res.json(specs.map(s => ({ department: s.department, proficiency: s.proficiency })));
});

// POST /api/consultants/:id/specialties - Update consultant's specialties
router.post('/:id/specialties', (req: Request, res: Response) => {
  const consultantId = parseInt(req.params.id);
  const { specialties: newSpecs } = req.body as { 
    specialties: Array<{ department: string; proficiency: 'standard' | 'expert' }> 
  };

  // Delete existing
  db.specialties.deleteByConsultantId(consultantId);

  // Insert new
  for (const spec of newSpecs) {
    db.specialties.insert({
      consultant_id: consultantId,
      department: spec.department,
      proficiency: spec.proficiency,
    });
  }

  res.json({ success: true });
});

// GET /api/consultants/:id/stats - Get consultant's statistics
router.get('/:id/stats', (req: Request, res: Response) => {
  const consultantId = parseInt(req.params.id);
  
  const allSessions = db.sessions.getAll().filter(
    s => s.consultant_id === consultantId && s.status === 'completed'
  );

  const totalSessions = allSessions.length;
  const avgDuration = totalSessions > 0 
    ? allSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions 
    : 0;
  const ratingsSum = allSessions.reduce((sum, s) => sum + (s.rating || 0), 0);
  const ratedCount = allSessions.filter(s => s.rating).length;
  const avgRating = ratedCount > 0 ? ratingsSum / ratedCount : null;

  const avail = db.availability.getByConsultantId(consultantId);

  res.json({
    totalSessions,
    avgDuration,
    avgRating,
    sessionsToday: avail?.sessions_today || 0,
    recentSessions: allSessions.slice(0, 5).map(s => ({
      id: s.id,
      department: s.department,
      duration: s.duration_seconds,
      rating: s.rating,
      date: s.created_at,
      hospitalName: db.hospitals.getById(s.hospital_id)?.name,
    })),
  });
});

// GET /api/consultants/meta/departments - Get list of all departments
router.get('/meta/departments', (_req: Request, res: Response) => {
  const departments = [
    'ER', 'Pharmacy', 'Radiology', 'Lab', 'IT', 'Build',
    'Registration', 'Billing', 'Nursing', 'Surgery', 'ICU', 'Outpatient',
  ];
  res.json(departments);
});

export default router;
