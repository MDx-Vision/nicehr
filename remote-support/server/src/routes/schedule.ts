import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import websocketService from '../services/websocket.js';

const router = Router();

// GET /api/schedule - Get user's scheduled sessions
router.get('/', (req: Request, res: Response) => {
  const userId = parseInt(req.query.userId as string);
  const role = req.query.role as string;

  let sessions;
  if (role === 'consultant' || role === 'admin') {
    sessions = db.scheduledSessions.getByConsultantId(userId);
  } else {
    sessions = db.scheduledSessions.getByUserId(userId);
  }

  const enriched = sessions.map(s => {
    const requester = db.users.getById(s.requester_id);
    const consultant = db.users.getById(s.consultant_id);
    const hospital = db.hospitals.getById(s.hospital_id);

    return {
      ...s,
      requesterName: requester?.name,
      consultantName: consultant?.name,
      hospitalName: hospital?.name,
    };
  });

  res.json(enriched);
});

// GET /api/schedule/upcoming - Get upcoming sessions (within next 15 mins)
router.get('/upcoming', (req: Request, res: Response) => {
  const userId = parseInt(req.query.userId as string);
  const minutes = parseInt(req.query.minutes as string) || 15;

  const upcoming = db.scheduledSessions.getUpcoming(userId, minutes);

  const enriched = upcoming.map(s => {
    const requester = db.users.getById(s.requester_id);
    const consultant = db.users.getById(s.consultant_id);

    return {
      ...s,
      requesterName: requester?.name,
      consultantName: consultant?.name,
    };
  });

  res.json(enriched);
});

// GET /api/schedule/consultant/:consultantId/availability - Get consultant's busy times
router.get('/consultant/:consultantId/availability', (req: Request, res: Response) => {
  const consultantId = parseInt(req.params.consultantId);
  const date = req.query.date as string; // YYYY-MM-DD

  const sessions = db.scheduledSessions.getByConsultantId(consultantId);

  // Filter to just the requested date if provided
  let filtered = sessions;
  if (date) {
    filtered = sessions.filter(s => s.scheduled_at.startsWith(date));
  }

  const busySlots = filtered.map(s => ({
    start: s.scheduled_at,
    end: new Date(new Date(s.scheduled_at).getTime() + s.duration_minutes * 60 * 1000).toISOString(),
    topic: s.topic,
  }));

  res.json(busySlots);
});

// POST /api/schedule - Create a new scheduled session
router.post('/', (req: Request, res: Response) => {
  const {
    requesterId,
    consultantId,
    hospitalId,
    department,
    scheduledAt,
    durationMinutes = 30,
    topic,
    notes,
  } = req.body;

  // Validate required fields
  if (!requesterId || !consultantId || !scheduledAt || !topic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for time conflicts
  if (db.scheduledSessions.hasConflict(consultantId, scheduledAt, durationMinutes)) {
    return res.status(409).json({ error: 'Consultant has a conflicting appointment at this time' });
  }

  // Validate the scheduled time is in the future
  if (new Date(scheduledAt) <= new Date()) {
    return res.status(400).json({ error: 'Scheduled time must be in the future' });
  }

  // Create the scheduled session
  const session = db.scheduledSessions.insert({
    requester_id: requesterId,
    consultant_id: consultantId,
    hospital_id: hospitalId,
    department: department || 'General',
    scheduled_at: scheduledAt,
    duration_minutes: durationMinutes,
    topic,
    notes: notes || null,
    status: 'scheduled',
    support_session_id: null,
  });

  // Get names for notification
  const requester = db.users.getById(requesterId);
  const consultant = db.users.getById(consultantId);
  const hospital = db.hospitals.getById(hospitalId);

  // Notify both parties
  const payload = {
    id: session.id,
    scheduledAt: session.scheduled_at,
    durationMinutes: session.duration_minutes,
    topic: session.topic,
    department: session.department,
    requesterName: requester?.name,
    consultantName: consultant?.name,
    hospitalName: hospital?.name,
  };

  websocketService.sendToUser(consultantId, 'scheduled_session_new', payload);
  websocketService.sendToUser(requesterId, 'scheduled_session_new', payload);

  res.json({
    ...session,
    requesterName: requester?.name,
    consultantName: consultant?.name,
    hospitalName: hospital?.name,
  });
});

// PUT /api/schedule/:id - Update a scheduled session
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { scheduledAt, durationMinutes, topic, notes, status } = req.body;

  const existing = db.scheduledSessions.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Scheduled session not found' });
  }

  // If rescheduling, check for conflicts
  if (scheduledAt && scheduledAt !== existing.scheduled_at) {
    const duration = durationMinutes || existing.duration_minutes;
    if (db.scheduledSessions.hasConflict(existing.consultant_id, scheduledAt, duration, id)) {
      return res.status(409).json({ error: 'Consultant has a conflicting appointment at this time' });
    }
  }

  const updates: any = { updated_at: new Date().toISOString() };
  if (scheduledAt) updates.scheduled_at = scheduledAt;
  if (durationMinutes) updates.duration_minutes = durationMinutes;
  if (topic) updates.topic = topic;
  if (notes !== undefined) updates.notes = notes;
  if (status) updates.status = status;

  const updated = db.scheduledSessions.update(id, updates);

  // Get names for notification
  const requester = db.users.getById(existing.requester_id);
  const consultant = db.users.getById(existing.consultant_id);

  // Notify both parties
  const payload = {
    id: updated!.id,
    scheduledAt: updated!.scheduled_at,
    status: updated!.status,
    topic: updated!.topic,
    requesterName: requester?.name,
    consultantName: consultant?.name,
  };

  websocketService.sendToUser(existing.consultant_id, 'scheduled_session_updated', payload);
  websocketService.sendToUser(existing.requester_id, 'scheduled_session_updated', payload);

  res.json(updated);
});

// POST /api/schedule/:id/cancel - Cancel a scheduled session
router.post('/:id/cancel', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { userId, reason } = req.body;

  const existing = db.scheduledSessions.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Scheduled session not found' });
  }

  // Verify user is part of this session
  if (existing.requester_id !== userId && existing.consultant_id !== userId) {
    return res.status(403).json({ error: 'Not authorized to cancel this session' });
  }

  const updated = db.scheduledSessions.update(id, {
    status: 'cancelled',
    notes: reason ? `Cancelled: ${reason}` : existing.notes,
  });

  // Get names for notification
  const requester = db.users.getById(existing.requester_id);
  const consultant = db.users.getById(existing.consultant_id);

  // Notify both parties
  const payload = {
    id: updated!.id,
    status: 'cancelled',
    cancelledBy: userId,
    reason,
    requesterName: requester?.name,
    consultantName: consultant?.name,
  };

  websocketService.sendToUser(existing.consultant_id, 'scheduled_session_updated', payload);
  websocketService.sendToUser(existing.requester_id, 'scheduled_session_updated', payload);

  res.json({ success: true });
});

// POST /api/schedule/:id/confirm - Consultant confirms a scheduled session
router.post('/:id/confirm', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { consultantId } = req.body;

  const existing = db.scheduledSessions.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Scheduled session not found' });
  }

  if (existing.consultant_id !== consultantId) {
    return res.status(403).json({ error: 'Only the assigned consultant can confirm' });
  }

  const updated = db.scheduledSessions.update(id, { status: 'confirmed' });

  // Notify requester
  const requester = db.users.getById(existing.requester_id);
  const consultant = db.users.getById(existing.consultant_id);

  websocketService.sendToUser(existing.requester_id, 'scheduled_session_updated', {
    id: updated!.id,
    status: 'confirmed',
    consultantName: consultant?.name,
  });

  res.json(updated);
});

// POST /api/schedule/:id/start - Start the scheduled session (creates a support session)
router.post('/:id/start', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const scheduled = db.scheduledSessions.getById(id);
  if (!scheduled) {
    return res.status(404).json({ error: 'Scheduled session not found' });
  }

  if (!['scheduled', 'confirmed'].includes(scheduled.status)) {
    return res.status(400).json({ error: 'Session cannot be started' });
  }

  // Create a support session
  const session = db.sessions.insert({
    hospital_id: scheduled.hospital_id,
    requester_id: scheduled.requester_id,
    consultant_id: scheduled.consultant_id,
    department: scheduled.department,
    urgency: 'normal',
    issue_summary: scheduled.topic,
    status: 'connecting',
  });

  // Update scheduled session
  db.scheduledSessions.update(id, {
    status: 'completed',
    support_session_id: session.id,
  });

  // Update consultant status
  db.availability.update(scheduled.consultant_id, {
    status: 'busy',
    current_session_id: session.id,
  });

  res.json({
    scheduledSessionId: id,
    supportSessionId: session.id,
  });
});

export default router;
