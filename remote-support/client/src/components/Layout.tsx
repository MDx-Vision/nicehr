import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { subscribeGlobal } from '../hooks/useWebSocket';
import StatusBadge from './support/StatusBadge';
import {
  Home,
  Headphones,
  ListTodo,
  History,
  Settings,
  LogOut,
  Phone,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface IncomingCall {
  sessionId: number;
  requesterName: string;
  hospitalName: string;
  department: string;
  issueSummary: string;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  const isConsultant = user?.role === 'consultant' || user?.role === 'admin';
  const isStaff = user?.role === 'hospital_staff' || user?.role === 'hospital_leadership';

  // Listen for auto-match notifications (consultant gets assigned a call)
  useEffect(() => {
    if (!isConsultant) return;

    const unsubscribe = subscribeGlobal('support_request_accepted', (payload) => {
      const data = payload as {
        sessionId: number;
        requesterName: string;
        hospitalName: string;
        department: string;
        issueSummary: string;
        autoMatched?: boolean;
      };

      // Only show notification if this is an auto-match (consultant was assigned)
      if (data.autoMatched) {
        setIncomingCall({
          sessionId: data.sessionId,
          requesterName: data.requesterName,
          hospitalName: data.hospitalName,
          department: data.department,
          issueSummary: data.issueSummary,
        });

        // Auto-dismiss after 30 seconds
        setTimeout(() => setIncomingCall(null), 30000);
      }
    });

    return () => unsubscribe();
  }, [isConsultant]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      navigate(`/support/call/${incomingCall.sessionId}`);
      setIncomingCall(null);
    }
  };

  const handleDismissCall = () => {
    setIncomingCall(null);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, show: true },
    { path: '/support/request', label: 'Get Support', icon: Headphones, show: isStaff || user?.role === 'admin' },
    { path: '/support/queue', label: 'Support Queue', icon: ListTodo, show: isConsultant },
    { path: '/support/history', label: 'History', icon: History, show: true },
    { path: '/support/settings', label: 'Settings', icon: Settings, show: isConsultant },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">
                NICEHR Support
              </span>
            </Link>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'hospital_staff' ? user?.hospitalName : user?.role}
                </p>
              </div>
              {isConsultant && <StatusBadge userId={user?.id || 0} interactive />}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Switch User"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {navItems.filter(item => item.show).map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Incoming call notification for consultants */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-pulse">
            <div className="bg-primary-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Incoming Support Request</h3>
                  <p className="text-primary-100 text-sm">You've been matched!</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Requester</p>
                  <p className="font-medium text-gray-900">{incomingCall.requesterName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium text-gray-900">{incomingCall.hospitalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{incomingCall.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue</p>
                  <p className="text-gray-700 text-sm">{incomingCall.issueSummary}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDismissCall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Dismiss
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Join Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
