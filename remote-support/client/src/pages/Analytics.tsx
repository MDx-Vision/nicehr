import { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  Users,
  Star,
  Phone,
  TrendingUp,
  Building,
  Loader2,
  AlertCircle,
  Activity,
  UserCheck,
  Timer,
} from 'lucide-react';

interface Overview {
  totalSessions: number;
  avgWaitTime: number;
  avgDuration: number;
  avgRating: number | null;
  activeSessions: number;
  availableConsultants: number;
  todaySessions: number;
}

interface DepartmentData {
  department: string;
  count: number;
  avgDuration: number;
  avgRating: number | null;
}

interface HospitalData {
  name: string;
  count: number;
  avgWaitTime: number;
}

interface ConsultantData {
  id: number;
  name: string;
  totalSessions: number;
  avgDuration: number;
  avgRating: number | null;
  status: string;
  sessionsToday: number;
}

interface UrgencyData {
  normal: { count: number; avgWaitTime: number };
  urgent: { count: number; avgWaitTime: number };
  critical: { count: number; avgWaitTime: number };
}

interface HourlyData {
  hour: number;
  count: number;
}

interface RecentSession {
  id: number;
  department: string;
  urgency: string;
  requesterName: string;
  consultantName: string;
  hospitalName: string;
  duration: number;
  waitTime: number;
  rating: number | null;
  createdAt: string;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [byDepartment, setByDepartment] = useState<DepartmentData[]>([]);
  const [byHospital, setByHospital] = useState<HospitalData[]>([]);
  const [byConsultant, setByConsultant] = useState<ConsultantData[]>([]);
  const [byUrgency, setByUrgency] = useState<UrgencyData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [
          overviewRes,
          deptRes,
          hospitalRes,
          consultantRes,
          urgencyRes,
          hourlyRes,
          recentRes,
        ] = await Promise.all([
          fetch('/api/analytics/overview'),
          fetch('/api/analytics/by-department'),
          fetch('/api/analytics/by-hospital'),
          fetch('/api/analytics/by-consultant'),
          fetch('/api/analytics/by-urgency'),
          fetch('/api/analytics/hourly'),
          fetch('/api/analytics/recent-sessions?limit=5'),
        ]);

        setOverview(await overviewRes.json());
        setByDepartment(await deptRes.json());
        setByHospital(await hospitalRes.json());
        setByConsultant(await consultantRes.json());
        setByUrgency(await urgencyRes.json());
        setHourlyData(await hourlyRes.json());
        setRecentSessions(await recentRes.json());
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Find peak hour
  const peakHour = hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: 0, count: 0 });
  const maxHourlyCount = Math.max(...hourlyData.map(h => h.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Support performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 text-green-500" />
          Live data
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MetricCard
          icon={Phone}
          label="Total Sessions"
          value={overview?.totalSessions || 0}
          color="blue"
        />
        <MetricCard
          icon={Activity}
          label="Active Now"
          value={overview?.activeSessions || 0}
          color="green"
        />
        <MetricCard
          icon={UserCheck}
          label="Available"
          value={overview?.availableConsultants || 0}
          color="emerald"
          suffix="consultants"
        />
        <MetricCard
          icon={TrendingUp}
          label="Today"
          value={overview?.todaySessions || 0}
          color="purple"
          suffix="sessions"
        />
        <MetricCard
          icon={Clock}
          label="Avg Wait"
          value={formatDuration(overview?.avgWaitTime || 0)}
          color="yellow"
        />
        <MetricCard
          icon={Timer}
          label="Avg Duration"
          value={formatDuration(overview?.avgDuration || 0)}
          color="indigo"
        />
        <MetricCard
          icon={Star}
          label="Avg Rating"
          value={overview?.avgRating?.toFixed(1) || 'N/A'}
          color="orange"
          suffix={overview?.avgRating ? '/ 5' : ''}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Sessions by Department
          </h3>
          <div className="space-y-3">
            {byDepartment.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              byDepartment.slice(0, 8).map((dept) => {
                const maxCount = Math.max(...byDepartment.map(d => d.count), 1);
                const percentage = (dept.count / maxCount) * 100;
                return (
                  <div key={dept.department}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{dept.department}</span>
                      <span className="text-gray-500">
                        {dept.count} sessions
                        {dept.avgRating && <span className="ml-2">⭐ {dept.avgRating}</span>}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Peak Hours
            {peakHour.count > 0 && (
              <span className="ml-auto text-sm font-normal text-gray-500">
                Busiest: {formatTime(peakHour.hour)}
              </span>
            )}
          </h3>
          <div className="flex items-end justify-between h-32 gap-1">
            {hourlyData.filter((_, i) => i % 2 === 0).map((data) => {
              const height = maxHourlyCount > 0 ? (data.count / maxHourlyCount) * 100 : 0;
              const isPeak = data.hour === peakHour.hour;
              return (
                <div
                  key={data.hour}
                  className="flex-1 flex flex-col items-center"
                  title={`${formatTime(data.hour)}: ${data.count} sessions`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      isPeak ? 'bg-primary-600' : 'bg-primary-200'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-gray-400 mt-1">{data.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Hospital */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary-600" />
            By Hospital
          </h3>
          <div className="space-y-3">
            {byHospital.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              byHospital.map((hospital) => (
                <div key={hospital.name} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{hospital.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{hospital.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ~{formatDuration(hospital.avgWaitTime)} wait
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* By Urgency */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary-600" />
            By Urgency
          </h3>
          {byUrgency && (
            <div className="space-y-4">
              <UrgencyRow
                label="Normal"
                count={byUrgency.normal.count}
                avgWait={byUrgency.normal.avgWaitTime}
                color="bg-gray-500"
                formatDuration={formatDuration}
              />
              <UrgencyRow
                label="Urgent"
                count={byUrgency.urgent.count}
                avgWait={byUrgency.urgent.avgWaitTime}
                color="bg-yellow-500"
                formatDuration={formatDuration}
              />
              <UrgencyRow
                label="Critical"
                count={byUrgency.critical.count}
                avgWait={byUrgency.critical.avgWaitTime}
                color="bg-red-500"
                formatDuration={formatDuration}
              />
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary-600" />
            Recent Sessions
          </h3>
          <div className="space-y-3">
            {recentSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sessions yet</p>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    session.urgency === 'critical' ? 'bg-red-500' :
                    session.urgency === 'urgent' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{session.department}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.requesterName} → {session.consultantName}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.rating && (
                      <span className="text-yellow-500">⭐ {session.rating}</span>
                    )}
                    <p className="text-xs text-gray-500">{formatDuration(session.duration || 0)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Consultant Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Consultant Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">Consultant</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-right">Total Sessions</th>
                <th className="pb-3 font-medium text-right">Today</th>
                <th className="pb-3 font-medium text-right">Avg Duration</th>
                <th className="pb-3 font-medium text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {byConsultant.map((consultant) => (
                <tr key={consultant.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 font-medium text-gray-900">{consultant.name}</td>
                  <td className="py-3 text-center">
                    <StatusBadge status={consultant.status} />
                  </td>
                  <td className="py-3 text-right text-gray-700">{consultant.totalSessions}</td>
                  <td className="py-3 text-right text-gray-700">{consultant.sessionsToday}</td>
                  <td className="py-3 text-right text-gray-500">{formatDuration(consultant.avgDuration)}</td>
                  <td className="py-3 text-right">
                    {consultant.avgRating ? (
                      <span className="text-yellow-600">⭐ {consultant.avgRating}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  suffix?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">
        {label}
        {suffix && <span className="ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

// Urgency Row Component
function UrgencyRow({
  label,
  count,
  avgWait,
  color,
  formatDuration,
}: {
  label: string;
  count: number;
  avgWait: number;
  color: string;
  formatDuration: (s: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm font-medium text-gray-700 w-16">{label}</span>
      <span className="text-sm text-gray-900 font-semibold">{count}</span>
      <span className="text-xs text-gray-500 ml-auto">~{formatDuration(avgWait)} wait</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    available: { bg: 'bg-green-100', text: 'text-green-700' },
    busy: { bg: 'bg-red-100', text: 'text-red-700' },
    away: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    offline: { bg: 'bg-gray-100', text: 'text-gray-500' },
  };

  const cfg = config[status] || config.offline;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
