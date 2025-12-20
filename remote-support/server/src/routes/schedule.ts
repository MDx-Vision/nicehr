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
    // All-day support
    isAllDay = false,
    allDayStartTime,
    allDayEndTime,
    // Recurring sessions
    isRecurring = false,
    recurrencePattern,
    recurrenceDays,
    recurrenceEndDate,
  } = req.body;

  // Validate required fields
  if (!requesterId || !consultantId || !scheduledAt || !topic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // For all-day sessions, calculate duration from start/end times
  let actualDuration = durationMinutes;
  if (isAllDay && allDayStartTime && allDayEndTime) {
    const [startHour, startMin] = allDayStartTime.split(':').map(Number);
    const [endHour, endMin] = allDayEndTime.split(':').map(Number);
    actualDuration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }

  // Check for time conflicts (skip for recurring - we'll check each instance)
  if (!isRecurring && db.scheduledSessions.hasConflict(consultantId, scheduledAt, actualDuration)) {
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
    duration_minutes: actualDuration,
    topic,
    notes: notes || null,
    status: 'scheduled',
    support_session_id: null,
    is_all_day: isAllDay,
    all_day_start_time: isAllDay ? allDayStartTime : null,
    all_day_end_time: isAllDay ? allDayEndTime : null,
    is_recurring: isRecurring,
    recurrence_pattern: isRecurring ? recurrencePattern : null,
    recurrence_days: isRecurring ? recurrenceDays : null,
    recurrence_end_date: isRecurring ? recurrenceEndDate : null,
    parent_session_id: null,
  });

  // If recurring, create future instances
  if (isRecurring && recurrencePattern && recurrenceEndDate) {
    createRecurringInstances(session, recurrencePattern, recurrenceDays, recurrenceEndDate);
  }

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
    isAllDay: session.is_all_day,
    isRecurring: session.is_recurring,
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

// Helper function to create recurring session instances
function createRecurringInstances(
  parentSession: any,
  pattern: string,
  recurrenceDays: string | null,
  endDate: string
) {
  const startDate = new Date(parentSession.scheduled_at);
  const endDateTime = new Date(endDate);
  const instances = [];

  let currentDate = new Date(startDate);
  const daysOfWeek = recurrenceDays ? recurrenceDays.split(',').map(Number) : [];

  while (currentDate <= endDateTime) {
    // Skip the first date (parent session)
    if (currentDate.getTime() !== startDate.getTime()) {
      // Check if this day matches recurrence pattern
      let shouldCreate = false;

      if (pattern === 'daily') {
        shouldCreate = true;
      } else if (pattern === 'weekly' && daysOfWeek.length > 0) {
        shouldCreate = daysOfWeek.includes(currentDate.getDay());
      } else if (pattern === 'biweekly' && daysOfWeek.length > 0) {
        const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        shouldCreate = weeksDiff % 2 === 0 && daysOfWeek.includes(currentDate.getDay());
      } else if (pattern === 'monthly') {
        shouldCreate = currentDate.getDate() === startDate.getDate();
      }

      if (shouldCreate) {
        // Check for conflicts before creating
        if (!db.scheduledSessions.hasConflict(
          parentSession.consultant_id,
          currentDate.toISOString(),
          parentSession.duration_minutes
        )) {
          db.scheduledSessions.insert({
            requester_id: parentSession.requester_id,
            consultant_id: parentSession.consultant_id,
            hospital_id: parentSession.hospital_id,
            department: parentSession.department,
            scheduled_at: currentDate.toISOString(),
            duration_minutes: parentSession.duration_minutes,
            topic: parentSession.topic,
            notes: parentSession.notes,
            status: 'scheduled',
            support_session_id: null,
            is_all_day: parentSession.is_all_day,
            all_day_start_time: parentSession.all_day_start_time,
            all_day_end_time: parentSession.all_day_end_time,
            is_recurring: true,
            recurrence_pattern: pattern,
            recurrence_days: recurrenceDays,
            recurrence_end_date: endDate,
            parent_session_id: parentSession.id,
          });
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

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

// ============ Staff Schedule Management ============

// GET /api/schedule/staff/:staffId/schedule - Get staff's weekly schedule
router.get('/staff/:staffId/schedule', (req: Request, res: Response) => {
  const staffId = parseInt(req.params.staffId);
  const schedules = db.staffSchedules.getByStaffId(staffId);

  // If no schedule exists, return default 9-5 Mon-Fri
  if (schedules.length === 0) {
    const defaultSchedule = [1, 2, 3, 4, 5].map(day => ({
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
    }));
    return res.json(defaultSchedule);
  }

  res.json(schedules);
});

// PUT /api/schedule/staff/:staffId/schedule - Update staff's weekly schedule
router.put('/staff/:staffId/schedule', (req: Request, res: Response) => {
  const staffId = parseInt(req.params.staffId);
  const { schedules } = req.body; // Array of { day_of_week, start_time, end_time, is_available }

  if (!Array.isArray(schedules)) {
    return res.status(400).json({ error: 'Invalid schedule format' });
  }

  const updated = schedules.map(s => {
    return db.staffSchedules.upsert(staffId, s.day_of_week, {
      start_time: s.start_time,
      end_time: s.end_time,
      is_available: s.is_available,
    });
  });

  res.json(updated);
});

// GET /api/schedule/staff/:staffId/availability - Check staff availability for a specific date
router.get('/staff/:staffId/availability', (req: Request, res: Response) => {
  const staffId = parseInt(req.params.staffId);
  const date = req.query.date as string; // YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const dayOfWeek = new Date(date).getDay();
  const schedule = db.staffSchedules.getAvailability(staffId, dayOfWeek);

  if (!schedule) {
    // Check if it's a weekday, default to available 9-5
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    return res.json({
      is_available: isWeekday,
      start_time: '09:00',
      end_time: '17:00',
    });
  }

  res.json({
    is_available: schedule.is_available,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
  });
});

export default router;
