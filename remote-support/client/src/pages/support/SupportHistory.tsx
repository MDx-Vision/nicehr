import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import {
  Clock,
  Star,
  User,
  Building,
  Calendar,
  Loader2,
  Inbox,
} from 'lucide-react';

interface Session {
  id: number;
  department: string;
  status: string;
  issue_summary: string;
  resolution_notes: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  rating: number | null;
  feedback: string | null;
  requesterName: string;
  consultantName: string | null;
  hospitalName: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' },
  escalated: { label: 'Escalated', color: 'bg-yellow-100 text-yellow-700' },
};

export default function SupportHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/support/history?userId=${user?.id}&role=${user?.role}&limit=50`)
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load history:', err);
        setLoading(false);
      });
  }, [user?.id, user?.role]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
        <p className="text-gray-500 mt-1">
          {sessions.length === 0
            ? 'No past sessions'
            : `${sessions.length} past session${sessions.length > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Sessions Yet</h3>
          <p className="text-gray-500">
            Your support session history will appear here
          </p>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-4">
        {sessions.map(session => {
          const status = statusConfig[session.status] || statusConfig.completed;
          const isExpanded = expandedId === session.id;

          return (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        {session.department}
                      </span>
                      {session.rating && (
                        <span className="flex items-center gap-1 text-sm text-yellow-600">
                          <Star className="w-4 h-4 fill-current" />
                          {session.rating}
                        </span>
                      )}
                    </div>

                    {/* Issue summary */}
                    <p className="text-gray-900 mb-3 line-clamp-2">
                      {session.issue_summary}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(session.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(session.duration_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {session.consultantName || 'No consultant'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {session.hospitalName}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Resolution notes */}
                    {session.resolution_notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Resolution Notes
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {session.resolution_notes}
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {session.feedback && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Feedback
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {session.feedback}
                        </p>
                      </div>
                    )}

                    {/* Participants */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Participants
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="text-gray-500">Requester:</span> {session.requesterName}</p>
                        <p><span className="text-gray-500">Consultant:</span> {session.consultantName || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Timing */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Timing
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="text-gray-500">Created:</span> {formatDate(session.created_at)}</p>
                        {session.started_at && (
                          <p><span className="text-gray-500">Started:</span> {formatDate(session.started_at)}</p>
                        )}
                        {session.ended_at && (
                          <p><span className="text-gray-500">Ended:</span> {formatDate(session.ended_at)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
