import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import dailyService from '../services/daily.js';
import { matchConsultant } from '../services/matching.js';
import websocketService from '../services/websocket.js';

const router = Router();

// Helper to broadcast queue updates to all consultants
function broadcastQueueUpdate() {
  const queueItems = db.queue.getAll();
  const enriched = queueItems.map(item => {
    const session = db.sessions.getById(item.session_id);
    if (!session || session.status !== 'pending') return null;
    const requester = db.users.getById(session.requester_id);
    const hospital = db.hospitals.getById(session.hospital_id);
    return {
      id: session.id,
      department: session.department,
      urgency: session.urgency,
      issueSummary: session.issue_summary,
      createdAt: session.created_at,
      position: item.position,
      requesterName: requester?.name,
      hospitalName: hospital?.name,
    };
  }).filter(Boolean);

  enriched.sort((a, b) => {
    const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
    const aUrgency = urgencyOrder[a!.urgency as keyof typeof urgencyOrder] ?? 2;
    const bUrgency = urgencyOrder[b!.urgency as keyof typeof urgencyOrder] ?? 2;
    if (aUrgency !== bUrgency) return aUrgency - bUrgency;
    return (a!.position || 0) - (b!.position || 0);
  });

  websocketService.broadcastToConsultants('support_request_new', { queue: enriched });
}

// POST /api/support/request - Hospital staff requests support
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { requesterId, hospitalId, department, urgency = 'normal', issueSummary } = req.body;

    // Check for existing pending request
    const existing = db.sessions.getActive(requesterId);
    if (existing && existing.requester_id === requesterId) {
      return res.status(400).json({ 
        error: 'You already have an active support request',
        sessionId: existing.id,
      });
    }

    // Create the session
    const session = db.sessions.insert({
      hospital_id: hospitalId,
      requester_id: requesterId,
      department,
      urgency,
      issue_summary: issueSummary,
      status: 'pending',
    });

    // Log event
    db.events.insert({
      session_id: session.id,
      event_type: 'created',
      actor_id: requesterId,
      metadata: JSON.stringify({ department, urgency }),
    });

    // Try to find a matching consultant
    const matchResult = matchConsultant({
      staffId: requesterId,
      hospitalId,
      department,
    });

    if (matchResult) {
      // Found an available consultant - create room
      const room = await dailyService.createRoom({ sessionId: session.id });

      // Update session
      db.sessions.update(session.id, {
        consultant_id: matchResult.consultant.id,
        daily_room_name: room.name,
        daily_room_url: room.url,
        status: 'connecting',
      });

      // Update consultant status
      db.availability.update(matchResult.consultant.id, {
        status: 'busy',
        current_session_id: session.id,
      });

      // Log event
      db.events.insert({
        session_id: session.id,
        event_type: 'matched',
        actor_id: matchResult.consultant.id,
        metadata: JSON.stringify({ matchReasons: matchResult.reasons }),
      });

      // Get requester info for notification
      const requester = db.users.getById(requesterId);
      const hospital = db.hospitals.getById(hospitalId);

      // Notify the matched consultant via WebSocket
      websocketService.sendToUser(matchResult.consultant.id, 'support_request_accepted', {
        sessionId: session.id,
        requesterId,
        requesterName: requester?.name,
        hospitalName: hospital?.name,
        department,
        urgency,
        issueSummary,
        roomUrl: room.url,
        autoMatched: true,
      });

      // Also broadcast status change
      websocketService.broadcast('consultant_status_changed', {
        consultantId: matchResult.consultant.id,
        status: 'busy',
      });

      return res.json({
        sessionId: session.id,
        status: 'connecting',
        consultant: matchResult.consultant,
        matchReasons: matchResult.reasons,
        roomUrl: room.url,
      });
    }

    // No consultant available - add to queue
    const queuePosition = db.queue.getMaxPosition() + 1;
    db.queue.insert({
      session_id: session.id,
      position: queuePosition,
    });

    // Broadcast new request to consultants
    broadcastQueueUpdate();

    return res.json({
      sessionId: session.id,
      status: 'pending',
      queuePosition,
    });

  } catch (error) {
    console.error('Error creating support request:', error);
    res.status(500).json({ error: 'Failed to create support request' });
  }
});

// GET /api/support/queue - Get current support queue
router.get('/queue', (_req: Request, res: Response) => {
  const queueItems = db.queue.getAll();
  
  const enriched = queueItems.map(item => {
    const session = db.sessions.getById(item.session_id);
    if (!session || session.status !== 'pending') return null;
    
    const requester = db.users.getById(session.requester_id);
    const hospital = db.hospitals.getById(session.hospital_id);

    return {
      id: session.id,
      department: session.department,
      urgency: session.urgency,
      issueSummary: session.issue_summary,
      createdAt: session.created_at,
      position: item.position,
      requesterName: requester?.name,
      hospitalName: hospital?.name,
    };
  }).filter(Boolean);

  // Sort by urgency then position
  enriched.sort((a, b) => {
    const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
    const aUrgency = urgencyOrder[a!.urgency as keyof typeof urgencyOrder] ?? 2;
    const bUrgency = urgencyOrder[b!.urgency as keyof typeof urgencyOrder] ?? 2;
    if (aUrgency !== bUrgency) return aUrgency - bUrgency;
    return (a!.position || 0) - (b!.position || 0);
  });

  res.json(enriched);
});

// POST /api/support/accept/:sessionId - Consultant accepts a request
router.post('/accept/:sessionId', async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionId);
  const { consultantId } = req.body;

  try {
    const session = db.sessions.getById(sessionId);
    
    if (!session || session.status !== 'pending') {
      return res.status(409).json({ error: 'Session no longer available' });
    }

    // Create Daily.co room
    const room = await dailyService.createRoom({ sessionId });

    // Update session
    db.sessions.update(sessionId, {
      consultant_id: consultantId,
      daily_room_name: room.name,
      daily_room_url: room.url,
      status: 'connecting',
      wait_time_seconds: Math.floor(
        (Date.now() - new Date(session.created_at).getTime()) / 1000
      ),
    });

    // Remove from queue
    db.queue.delete(sessionId);

    // Update consultant status
    const avail = db.availability.getByConsultantId(consultantId);
    db.availability.update(consultantId, {
      status: 'busy',
      current_session_id: sessionId,
      sessions_today: (avail?.sessions_today || 0) + 1,
    });

    // Log event
    db.events.insert({
      session_id: sessionId,
      event_type: 'accepted',
      actor_id: consultantId,
    });

    // Get consultant info for notification
    const consultant = db.users.getById(consultantId);

    // Notify requester that their request was accepted
    websocketService.sendToUser(session.requester_id, 'support_request_accepted', {
      sessionId,
      consultantId,
      consultantName: consultant?.name,
      roomUrl: room.url,
    });

    // Broadcast updated queue to all consultants
    broadcastQueueUpdate();

    res.json({
      sessionId,
      roomUrl: room.url,
      roomName: room.name,
    });

  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// POST /api/support/join/:sessionId - Get Daily.co token to join
router.post('/join/:sessionId', async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionId);
  const { userId, userName, isConsultant } = req.body;

  try {
    const session = db.sessions.getById(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!['connecting', 'active'].includes(session.status)) {
      return res.status(400).json({ error: 'Session is not active' });
    }

    if (userId !== session.requester_id && userId !== session.consultant_id) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    if (!session.daily_room_name) {
      return res.status(400).json({ error: 'Room not ready' });
    }

    const token = await dailyService.createToken({
      roomName: session.daily_room_name,
      participantId: userId,
      participantName: userName,
      isOwner: isConsultant,
    });

    res.json({
      token,
      roomUrl: session.daily_room_url,
      roomName: session.daily_room_name,
    });

  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// POST /api/support/start/:sessionId - Mark session as active
router.post('/start/:sessionId', (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionId);

  const session = db.sessions.getById(sessionId);
  if (!session || session.status !== 'connecting') {
    return res.status(400).json({ error: 'Session not in connecting state' });
  }

  db.sessions.update(sessionId, {
    status: 'active',
    started_at: new Date().toISOString(),
  });

  db.events.insert({
    session_id: sessionId,
    event_type: 'started',
  });

  // Notify both parties that session started
  websocketService.sendToSession(
    session.requester_id,
    session.consultant_id,
    'support_session_started',
    { sessionId, startedAt: new Date().toISOString() }
  );

  res.json({ success: true });
});

// POST /api/support/end/:sessionId - End a session
router.post('/end/:sessionId', async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionId);
  const { resolutionNotes, endedBy } = req.body;

  try {
    const session = db.sessions.getById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const durationSeconds = session.started_at
      ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
      : 0;

    // Update session
    db.sessions.update(sessionId, {
      status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      resolution_notes: resolutionNotes || null,
    });

    // Free up consultant
    if (session.consultant_id) {
      db.availability.update(session.consultant_id, {
        status: 'available',
        current_session_id: null,
        last_session_ended_at: new Date().toISOString(),
      });
    }

    // Log event
    db.events.insert({
      session_id: sessionId,
      event_type: 'ended',
      actor_id: endedBy,
      metadata: JSON.stringify({ durationSeconds }),
    });

    // Delete Daily.co room
    if (session.daily_room_name) {
      await dailyService.deleteRoom(session.daily_room_name);
    }

    // Notify both parties that session ended
    websocketService.sendToSession(
      session.requester_id,
      session.consultant_id,
      'support_session_ended',
      { sessionId, durationSeconds, endedBy }
    );

    // Broadcast consultant status change
    if (session.consultant_id) {
      websocketService.broadcast('consultant_status_changed', {
        consultantId: session.consultant_id,
        status: 'available',
      });
    }

    res.json({ success: true, durationSeconds });

  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// POST /api/support/rate/:sessionId - Rate a session
router.post('/rate/:sessionId', (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionId);
  const { rating, feedback, userId } = req.body;

  const session = db.sessions.getById(sessionId);
  if (!session || session.requester_id !== userId) {
    return res.status(400).json({ error: 'Cannot rate this session' });
  }

  db.sessions.update(sessionId, { rating, feedback: feedback || null });

  // Update staff-consultant preference
  if (session.consultant_id) {
    const existing = db.preferences.get(session.requester_id, session.consultant_id);
    const newCount = (existing?.successful_sessions || 0) + 1;
    const newAvg = existing?.avg_rating 
      ? ((existing.avg_rating * existing.successful_sessions) + rating) / newCount
      : rating;

    db.preferences.upsert(session.requester_id, session.consultant_id, {
      successful_sessions: newCount,
      avg_rating: newAvg,
      last_session_at: new Date().toISOString(),
    });
  }

  db.events.insert({
    session_id: sessionId,
    event_type: 'rated',
    actor_id: userId,
    metadata: JSON.stringify({ rating, feedback }),
  });

  res.json({ success: true });
});

// POST /api/support/cancel/:sessionId - Cancel a pending request
router.post('/cancel/:sessionId', (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionId);
  const { userId } = req.body;

  const session = db.sessions.getById(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  if (session.requester_id !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (session.status !== 'pending') {
    return res.status(400).json({ error: 'Can only cancel pending sessions' });
  }

  db.sessions.update(sessionId, { status: 'cancelled' });
  db.queue.delete(sessionId);

  db.events.insert({
    session_id: sessionId,
    event_type: 'cancelled',
    actor_id: userId,
  });

  // Broadcast updated queue to consultants
  broadcastQueueUpdate();

  res.json({ success: true });
});

// GET /api/support/active - Get user's active session
router.get('/active', (req: Request, res: Response) => {
  const userId = parseInt(req.query.userId as string);
  
  const session = db.sessions.getActive(userId);
  
  if (!session) {
    return res.json(null);
  }

  const consultant = session.consultant_id ? db.users.getById(session.consultant_id) : null;
  const requester = db.users.getById(session.requester_id);
  const hospital = db.hospitals.getById(session.hospital_id);

  res.json({
    ...session,
    consultantName: consultant?.name,
    requesterName: requester?.name,
    hospitalName: hospital?.name,
  });
});

// GET /api/support/history - Get past sessions
router.get('/history', (req: Request, res: Response) => {
  const userId = parseInt(req.query.userId as string);
  const role = req.query.role as string;
  const limit = parseInt(req.query.limit as string) || 20;

  const history = db.sessions.getHistory(userId, role, limit);

  const enriched = history.map(s => {
    const requester = db.users.getById(s.requester_id);
    const consultant = s.consultant_id ? db.users.getById(s.consultant_id) : null;
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

export default router;
