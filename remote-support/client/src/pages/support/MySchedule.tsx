import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { subscribeGlobal } from '../../hooks/useWebSocket';
import {
  Calendar,
  Clock,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Plus,
  AlertCircle,
} from 'lucide-react';

interface ScheduledSession {
  id: number;
  requester_id: number;
  consultant_id: number;
  department: string;
  scheduled_at: string;
  duration_minutes: number;
  topic: string;
  notes: string | null;
  status: string;
  requesterName: string;
  consultantName: string;
  hospitalName: string;
}

export default function MySchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const isConsultant = user?.role === 'consultant' || user?.role === 'admin';

  // Fetch scheduled sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/schedule?userId=${user?.id}&role=${user?.role}`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch scheduled sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.id, user?.role]);

  // Subscribe to schedule updates
  useEffect(() => {
    const unsubNew = subscribeGlobal('scheduled_session_new', () => fetchSessions());
    const unsubUpdated = subscribeGlobal('scheduled_session_updated', () => fetchSessions());

    return () => {
      unsubNew();
      unsubUpdated();
    };
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateStr: string) => {
    const now = new Date();
    const scheduled = new Date(dateStr);
    const diff = scheduled.getTime() - now.getTime();
    return diff > 0 && diff < 15 * 60 * 1000; // Within 15 minutes
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  const handleConfirm = async (sessionId: number) => {
    setActionLoading(sessionId);
    try {
      await fetch(`/api/schedule/${sessionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: user?.id }),
      });
      fetchSessions();
    } catch (err) {
      console.error('Failed to confirm session:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (sessionId: number) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    setActionLoading(sessionId);
    try {
      await fetch(`/api/schedule/${sessionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      fetchSessions();
    } catch (err) {
      console.error('Failed to cancel session:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (sessionId: number) => {
    setActionLoading(sessionId);
    try {
      const res = await fetch(`/api/schedule/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.supportSessionId) {
        navigate(`/support/call/${data.supportSessionId}`);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (session: ScheduledSession) => {
    if (session.status === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Confirmed
        </span>
      );
    }
    if (session.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500 mt-1">
            {isConsultant ? 'Your upcoming scheduled sessions' : 'Sessions you have scheduled'}
          </p>
        </div>
        {!isConsultant && (
          <button
            onClick={() => navigate('/support/schedule')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            Schedule Session
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Sessions</h3>
          <p className="text-gray-500 mb-4">
            {isConsultant
              ? "You don't have any scheduled sessions yet."
              : "You haven't scheduled any sessions yet."}
          </p>
          {!isConsultant && (
            <button
              onClick={() => navigate('/support/schedule')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Schedule a Session
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const upcoming = isUpcoming(session.scheduled_at);
            const past = isPast(session.scheduled_at);

            return (
              <div
                key={session.id}
                className={`bg-white rounded-xl border p-6 ${
                  upcoming ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'
                }`}
              >
                {upcoming && (
                  <div className="flex items-center gap-2 text-primary-600 text-sm font-medium mb-3">
                    <AlertCircle className="w-4 h-4" />
                    Starting soon!
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {isConsultant ? session.requesterName : session.consultantName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duration_minutes} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                        </span>
                        {getStatusBadge(session)}
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-500">{session.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {session.status !== 'cancelled' && !past && (
                    <div className="flex gap-2">
                      {isConsultant && session.status === 'scheduled' && (
                        <button
                          onClick={() => handleConfirm(session.id)}
                          disabled={actionLoading === session.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Confirm
                        </button>
                      )}

                      {(upcoming || (isConsultant && session.status === 'confirmed')) && (
                        <button
                          onClick={() => handleStart(session.id)}
                          disabled={actionLoading === session.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Start
                        </button>
                      )}

                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={actionLoading === session.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
