import { useState, useEffect } from 'react';
import { Circle, ChevronDown } from 'lucide-react';
import { subscribeGlobal } from '../../hooks/useWebSocket';

interface StatusBadgeProps {
  userId: number;
  interactive?: boolean;
}

type Status = 'available' | 'busy' | 'away' | 'offline';

const statusConfig: Record<Status, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-600', bgColor: 'bg-green-500' },
  busy: { label: 'Busy', color: 'text-red-600', bgColor: 'bg-red-500' },
  away: { label: 'Away', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
  offline: { label: 'Offline', color: 'text-gray-400', bgColor: 'bg-gray-400' },
};

export default function StatusBadge({ userId, interactive = false }: StatusBadgeProps) {
  const [status, setStatus] = useState<Status>('offline');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial status
    fetch(`/api/consultants`)
      .then(res => res.json())
      .then(consultants => {
        const me = consultants.find((c: { id: number }) => c.id === userId);
        if (me) {
          setStatus(me.status || 'offline');
        }
      })
      .catch(console.error);

    // Subscribe to real-time status changes
    const unsubscribe = subscribeGlobal('consultant_status_changed', (payload) => {
      const data = payload as { consultantId: number; status: Status };
      if (data.consultantId === userId) {
        setStatus(data.status);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const updateStatus = async (newStatus: Status) => {
    setLoading(true);
    try {
      const res = await fetch('/api/consultants/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: userId, status: newStatus }),
      });
      
      if (res.ok) {
        setStatus(newStatus);
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const config = statusConfig[status];

  if (!interactive) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
          isOpen ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {loading ? 'Updating...' : config.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {(Object.keys(statusConfig) as Status[]).map(s => {
              const cfg = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={s === status}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 ${
                    s === status ? 'bg-gray-50' : ''
                  }`}
                >
                  <Circle className={`w-3 h-3 fill-current ${cfg.color}`} />
                  <span className="text-sm">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
