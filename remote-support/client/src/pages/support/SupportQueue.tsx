import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { subscribeGlobal } from '../../hooks/useWebSocket';
import {
  AlertCircle,
  Clock,
  Building,
  User,
  Loader2,
  Inbox,
  RefreshCw,
  Wifi,
} from 'lucide-react';

interface QueueItem {
  id: number;
  department: string;
  urgency: 'normal' | 'urgent' | 'critical';
  issueSummary: string;
  createdAt: string;
  position: number;
  requesterName: string;
  hospitalName: string;
}

const urgencyConfig = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
  urgent: { label: 'Urgent', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function SupportQueue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/support/queue');
      const data = await res.json();
      setQueue(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch queue:', err);
      setError('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Subscribe to real-time queue updates via WebSocket
    const unsubscribe = subscribeGlobal('support_request_new', (payload) => {
      const data = payload as { queue: QueueItem[] };
      if (data.queue) {
        setQueue(data.queue);
      }
    });

    // Fallback polling every 30 seconds (in case WebSocket disconnects)
    const interval = setInterval(fetchQueue, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleAccept = async (sessionId: number) => {
    setAccepting(sessionId);
    setError('');

    try {
      const res = await fetch(`/api/support/accept/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: user?.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to accept request');
        setAccepting(null);
        fetchQueue(); // Refresh queue
        return;
      }

      // Navigate to call
      navigate(`/support/call/${sessionId}`);

    } catch (err) {
      console.error('Failed to accept request:', err);
      setError('Failed to connect to server');
      setAccepting(null);
    }
  };

  const formatWaitTime = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const seconds = Math.floor((now - created) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Queue</h1>
          <p className="text-gray-500 mt-1">
            {queue.length === 0 
              ? 'No requests waiting'
              : `${queue.length} request${queue.length > 1 ? 's' : ''} waiting for support`
            }
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchQueue(); }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {queue.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Requests</h3>
          <p className="text-gray-500">
            New support requests will appear here in real-time
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-green-600">
            <Wifi className="w-4 h-4" />
            Live updates enabled
          </div>
        </div>
      )}

      {/* Queue items */}
      <div className="space-y-4">
        {queue.map(item => {
          const urgency = urgencyConfig[item.urgency];
          
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${urgency.color}`}>
                      {urgency.label}
                    </span>
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      {item.department}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      Waiting {formatWaitTime(item.createdAt)}
                    </span>
                  </div>

                  {/* Issue summary */}
                  <p className="text-gray-900 mb-3 line-clamp-2">
                    {item.issueSummary}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {item.requesterName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {item.hospitalName}
                    </span>
                  </div>
                </div>

                {/* Accept button */}
                <button
                  onClick={() => handleAccept(item.id)}
                  disabled={accepting === item.id}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {accepting === item.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    'Accept'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
