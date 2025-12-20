import { Router, Request, Response } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/analytics/overview - Get high-level metrics
router.get('/overview', (req: Request, res: Response) => {
  const sessions = db.sessions.getAll();
  const completedSessions = sessions.filter(s => s.status === 'completed');

  // Total sessions
  const totalSessions = completedSessions.length;

  // Average wait time (seconds)
  const sessionsWithWait = completedSessions.filter(s => s.wait_time_seconds != null);
  const avgWaitTime = sessionsWithWait.length > 0
    ? Math.round(sessionsWithWait.reduce((sum, s) => sum + (s.wait_time_seconds || 0), 0) / sessionsWithWait.length)
    : 0;

  // Average call duration (seconds)
  const sessionsWithDuration = completedSessions.filter(s => s.duration_seconds != null);
  const avgDuration = sessionsWithDuration.length > 0
    ? Math.round(sessionsWithDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessionsWithDuration.length)
    : 0;

  // Average rating
  const sessionsWithRating = completedSessions.filter(s => s.rating != null);
  const avgRating = sessionsWithRating.length > 0
    ? (sessionsWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsWithRating.length).toFixed(1)
    : null;

  // Active sessions right now
  const activeSessions = sessions.filter(s => ['pending', 'connecting', 'active'].includes(s.status)).length;

  // Available consultants
  const availableConsultants = db.availability.getAvailable().length;

  // Today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = completedSessions.filter(s => s.created_at?.startsWith(today)).length;

  res.json({
    totalSessions,
    avgWaitTime,
    avgDuration,
    avgRating: avgRating ? parseFloat(avgRating) : null,
    activeSessions,
    availableConsultants,
    todaySessions,
  });
});

// GET /api/analytics/by-department - Sessions grouped by department
router.get('/by-department', (_req: Request, res: Response) => {
  const sessions = db.sessions.getAll().filter(s => s.status === 'completed');

  const byDepartment: Record<string, { count: number; avgDuration: number; avgRating: number | null }> = {};

  sessions.forEach(s => {
    if (!s.department) return;

    if (!byDepartment[s.department]) {
      byDepartment[s.department] = { count: 0, avgDuration: 0, avgRating: null };
    }
    byDepartment[s.department].count++;
  });

  // Calculate averages
  Object.keys(byDepartment).forEach(dept => {
    const deptSessions = sessions.filter(s => s.department === dept);

    const withDuration = deptSessions.filter(s => s.duration_seconds != null);
    byDepartment[dept].avgDuration = withDuration.length > 0
      ? Math.round(withDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / withDuration.length)
      : 0;

    const withRating = deptSessions.filter(s => s.rating != null);
    byDepartment[dept].avgRating = withRating.length > 0
      ? parseFloat((withRating.reduce((sum, s) => sum + (s.rating || 0), 0) / withRating.length).toFixed(1))
      : null;
  });

  // Convert to array and sort by count
  const result = Object.entries(byDepartment)
    .map(([department, data]) => ({ department, ...data }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});

// GET /api/analytics/by-hospital - Sessions grouped by hospital
router.get('/by-hospital', (_req: Request, res: Response) => {
  const sessions = db.sessions.getAll().filter(s => s.status === 'completed');

  const byHospital: Record<number, { name: string; count: number; avgWaitTime: number }> = {};

  sessions.forEach(s => {
    if (!s.hospital_id) return;

    if (!byHospital[s.hospital_id]) {
      const hospital = db.hospitals.getById(s.hospital_id);
      byHospital[s.hospital_id] = {
        name: hospital?.name || 'Unknown',
        count: 0,
        avgWaitTime: 0
      };
    }
    byHospital[s.hospital_id].count++;
  });

  // Calculate averages
  Object.keys(byHospital).forEach(hospitalId => {
    const id = parseInt(hospitalId);
    const hospitalSessions = sessions.filter(s => s.hospital_id === id);

    const withWait = hospitalSessions.filter(s => s.wait_time_seconds != null);
    byHospital[id].avgWaitTime = withWait.length > 0
      ? Math.round(withWait.reduce((sum, s) => sum + (s.wait_time_seconds || 0), 0) / withWait.length)
      : 0;
  });

  // Convert to array and sort by count
  const result = Object.values(byHospital).sort((a, b) => b.count - a.count);

  res.json(result);
});

// GET /api/analytics/by-consultant - Consultant performance metrics
router.get('/by-consultant', (_req: Request, res: Response) => {
  const sessions = db.sessions.getAll().filter(s => s.status === 'completed');
  const consultants = db.users.getByRole('consultant');

  const result = consultants.map(consultant => {
    const consultantSessions = sessions.filter(s => s.consultant_id === consultant.id);
    const totalSessions = consultantSessions.length;

    const withDuration = consultantSessions.filter(s => s.duration_seconds != null);
    const avgDuration = withDuration.length > 0
      ? Math.round(withDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / withDuration.length)
      : 0;

    const withRating = consultantSessions.filter(s => s.rating != null);
    const avgRating = withRating.length > 0
      ? parseFloat((withRating.reduce((sum, s) => sum + (s.rating || 0), 0) / withRating.length).toFixed(1))
      : null;

    const availability = db.availability.getByConsultantId(consultant.id);

    return {
      id: consultant.id,
      name: consultant.name,
      totalSessions,
      avgDuration,
      avgRating,
      status: availability?.status || 'offline',
      sessionsToday: availability?.sessions_today || 0,
    };
  }).sort((a, b) => b.totalSessions - a.totalSessions);

  res.json(result);
});

// GET /api/analytics/by-urgency - Sessions grouped by urgency
router.get('/by-urgency', (_req: Request, res: Response) => {
  const sessions = db.sessions.getAll().filter(s => s.status === 'completed');

  const byUrgency: Record<string, { count: number; avgWaitTime: number }> = {
    normal: { count: 0, avgWaitTime: 0 },
    urgent: { count: 0, avgWaitTime: 0 },
    critical: { count: 0, avgWaitTime: 0 },
  };

  sessions.forEach(s => {
    const urgency = s.urgency || 'normal';
    if (byUrgency[urgency]) {
      byUrgency[urgency].count++;
    }
  });

  // Calculate average wait times
  Object.keys(byUrgency).forEach(urgency => {
    const urgencySessions = sessions.filter(s => (s.urgency || 'normal') === urgency && s.wait_time_seconds != null);
    byUrgency[urgency].avgWaitTime = urgencySessions.length > 0
      ? Math.round(urgencySessions.reduce((sum, s) => sum + (s.wait_time_seconds || 0), 0) / urgencySessions.length)
      : 0;
  });

  res.json(byUrgency);
});

// GET /api/analytics/hourly - Sessions by hour of day (for peak hours)
router.get('/hourly', (_req: Request, res: Response) => {
  const sessions = db.sessions.getAll().filter(s => s.status === 'completed' && s.created_at);

  const byHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    byHour[i] = 0;
  }

  sessions.forEach(s => {
    if (s.created_at) {
      const hour = new Date(s.created_at).getHours();
      byHour[hour]++;
    }
  });

  const result = Object.entries(byHour).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }));

  res.json(result);
});

// GET /api/analytics/daily - Sessions by day (last 30 days)
router.get('/daily', (_req: Request, res: Response) => {
  const sessions = db.sessions.getAll().filter(s => s.status === 'completed' && s.created_at);

  // Get last 30 days
  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days[dateStr] = 0;
  }

  sessions.forEach(s => {
    if (s.created_at) {
      const dateStr = s.created_at.split('T')[0];
      if (days[dateStr] !== undefined) {
        days[dateStr]++;
      }
    }
  });

  const result = Object.entries(days).map(([date, count]) => ({
    date,
    count,
  }));

  res.json(result);
});

// GET /api/analytics/recent-sessions - Recent completed sessions
router.get('/recent-sessions', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const sessions = db.sessions.getAll()
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.ended_at || b.created_at).getTime() - new Date(a.ended_at || a.created_at).getTime())
    .slice(0, limit);

  const enriched = sessions.map(s => {
    const requester = db.users.getById(s.requester_id);
    const consultant = s.consultant_id ? db.users.getById(s.consultant_id) : null;
    const hospital = db.hospitals.getById(s.hospital_id);

    return {
      id: s.id,
      department: s.department,
      urgency: s.urgency,
      requesterName: requester?.name,
      consultantName: consultant?.name,
      hospitalName: hospital?.name,
      duration: s.duration_seconds,
      waitTime: s.wait_time_seconds,
      rating: s.rating,
      createdAt: s.created_at,
      endedAt: s.ended_at,
    };
  });

  res.json(enriched);
});

export default router;
