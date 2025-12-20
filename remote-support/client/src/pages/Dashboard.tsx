import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import {
  Headphones,
  ListTodo,
  Clock,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface Stats {
  totalSessions: number;
  avgDuration: number;
  avgRating: number;
  sessionsToday: number;
}

interface ActiveSession {
  id: number;
  status: string;
  department: string;
  consultantName?: string;
  daily_room_url?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  const isConsultant = user?.role === 'consultant' || user?.role === 'admin';
  const isStaff = user?.role === 'hospital_staff' || user?.role === 'hospital_leadership';

  useEffect(() => {
    // Fetch active session
    fetch(`/api/support/active?userId=${user?.id}`)
      .then(res => res.json())
      .then(data => setActiveSession(data))
      .catch(console.error);

    // Fetch queue length for consultants
    if (isConsultant) {
      fetch('/api/support/queue')
        .then(res => res.json())
        .then(data => setQueueLength(data.length))
        .catch(console.error);

      // Fetch consultant stats
      fetch(`/api/consultants/${user?.id}/stats`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [user?.id, isConsultant]);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const mins = Math.round(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          {isConsultant ? 'Ready to help hospitals today?' : `${user?.hospitalName} Support Portal`}
        </p>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Headphones className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900">
                  Active Support Session
                </h3>
                <p className="text-sm text-primary-700">
                  {activeSession.status === 'pending' 
                    ? 'Waiting for a consultant...'
                    : `${activeSession.department} - ${activeSession.consultantName || 'Connecting...'}`
                  }
                </p>
              </div>
            </div>
            <Link
              to={`/support/call/${activeSession.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {activeSession.status === 'pending' ? 'View Queue' : 'Join Call'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isStaff && !activeSession && (
          <Link
            to="/support/request"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <Headphones className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Get Support Now</h3>
              <p className="text-sm text-gray-500">Connect with a consultant instantly</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </Link>
        )}

        {isConsultant && (
          <Link
            to="/support/queue"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ListTodo className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Support Queue</h3>
              <p className="text-sm text-gray-500">
                {queueLength === 0 
                  ? 'No requests waiting'
                  : `${queueLength} request${queueLength > 1 ? 's' : ''} waiting`
                }
              </p>
            </div>
            {queueLength > 0 && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {queueLength}
              </span>
            )}
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        )}

        <Link
          to="/support/history"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Session History</h3>
            <p className="text-sm text-gray-500">View past support sessions</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>
      </div>

      {/* Consultant Stats */}
      {isConsultant && stats && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Today</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.sessionsToday}</p>
              <p className="text-sm text-gray-500">sessions</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              <p className="text-sm text-gray-500">all time</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
              <p className="text-sm text-gray-500">per session</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-sm">Rating</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgRating ? stats.avgRating.toFixed(1) : '-'}
              </p>
              <p className="text-sm text-gray-500">average</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
