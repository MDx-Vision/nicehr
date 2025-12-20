import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { subscribeGlobal } from '../../hooks/useWebSocket';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import {
  Loader2,
  Clock,
  AlertCircle,
  X,
  Wifi,
} from 'lucide-react';
import RatingModal from '../../components/support/RatingModal';

interface SessionInfo {
  id: number;
  status: string;
  department: string;
  issueSummary: string;
  consultantName?: string;
  requesterName?: string;
  daily_room_url: string;
  daily_room_name: string;
  started_at?: string;
}

export default function VideoCall() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState('');
  const [showRating, setShowRating] = useState(false);
  
  const [callDuration, setCallDuration] = useState(0);

  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isConsultant = user?.role === 'consultant' || user?.role === 'admin';

  // Fetch session info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/support/active?userId=${user?.id}`);
        const data = await res.json();

        if (!data || data.id !== parseInt(sessionId!)) {
          setError('Session not found or not authorized');
          setLoading(false);
          return;
        }

        setSession(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to load session');
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to session accepted event (for staff waiting in queue)
    const unsubAccepted = subscribeGlobal('support_request_accepted', (payload) => {
      const data = payload as { sessionId: number; consultantName: string };
      if (data.sessionId === parseInt(sessionId!)) {
        // Refresh session to get updated status
        fetchSession();
      }
    });

    // Subscribe to session ended event
    const unsubEnded = subscribeGlobal('support_session_ended', (payload) => {
      const data = payload as { sessionId: number };
      if (data.sessionId === parseInt(sessionId!)) {
        // Other party ended the call
        if (!isConsultant) {
          setShowRating(true);
        } else {
          navigate('/');
        }
      }
    });

    // Fallback polling every 30 seconds
    const interval = setInterval(fetchSession, 30000);

    return () => {
      unsubAccepted();
      unsubEnded();
      clearInterval(interval);
    };
  }, [sessionId, user?.id, isConsultant, navigate]);

  // Join the call
  const joinCall = useCallback(async () => {
    if (!session?.daily_room_name || !containerRef.current) return;

    // Prevent duplicate instances
    if (callFrameRef.current) {
      console.warn('Call frame already exists');
      return;
    }

    setJoining(true);
    setError('');

    try {
      // Clear any existing iframes in container
      containerRef.current.innerHTML = '';

      // Get token from server
      const tokenRes = await fetch(`/api/support/join/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          isConsultant,
        }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.error || 'Failed to get call token');
      }

      const { token, roomUrl } = await tokenRes.json();

      // Create iframe manually with proper permissions for screen sharing
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.allow = 'microphone; camera; autoplay; display-capture; fullscreen';
      containerRef.current.appendChild(iframe);

      // Wrap the iframe with Daily.co instead of using createFrame
      const callFrame = DailyIframe.wrap(iframe, {
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      callFrameRef.current = callFrame;

      // Set up event handlers
      callFrame.on('joined-meeting', async () => {
        setInCall(true);
        setJoining(false);
        
        // Notify server that call started
        await fetch(`/api/support/start/${sessionId}`, { method: 'POST' });
        
        // Start duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      });

      callFrame.on('left-meeting', async () => {
        setInCall(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        // Clean up the frame
        if (callFrameRef.current) {
          callFrameRef.current.destroy();
          callFrameRef.current = null;
        }

        // End session on server
        await fetch(`/api/support/end/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endedBy: user?.id }),
        });

        // Show rating for staff, navigate away for consultants
        if (!isConsultant) {
          setShowRating(true);
        } else {
          navigate('/');
        }
      });

      callFrame.on('error', (e) => {
        console.error('Daily.co error:', e);
        setError('Video call error occurred');
        setJoining(false);
      });

      // Join the meeting
      await callFrame.join({ url: roomUrl, token });

    } catch (err) {
      console.error('Failed to join call:', err);
      setError(err instanceof Error ? err.message : 'Failed to join call');
      setJoining(false);
      // Clean up the callFrame and iframe on error
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [session, sessionId, user, isConsultant]);

  // Cancel pending request
  const cancelRequest = async () => {
    await fetch(`/api/support/cancel/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id }),
    });
    navigate('/');
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Handle rating completion
  const handleRatingComplete = () => {
    setShowRating(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Error</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Waiting room for pending status
  if (session?.status === 'pending') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Waiting for a Consultant
        </h2>
        <p className="text-gray-500 mb-4">
          Your request for <span className="font-medium">{session.department}</span> support is in the queue.
          You'll be notified instantly when a consultant accepts.
        </p>
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-green-600">
          <Wifi className="w-4 h-4" />
          Live updates enabled
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Issue:</span> {session.issueSummary}
          </p>
        </div>
        <button
          onClick={cancelRequest}
          className="flex items-center gap-2 mx-auto px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel Request
        </button>
      </div>
    );
  }

  // Rating modal
  if (showRating) {
    return (
      <RatingModal
        sessionId={parseInt(sessionId!)}
        userId={user?.id || 0}
        onComplete={handleRatingComplete}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {session?.department} Support
          </h1>
          <p className="text-sm text-gray-500">
            with {isConsultant ? session?.requesterName : session?.consultantName}
          </p>
        </div>
        {inCall && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatDuration(callDuration)}</span>
          </div>
        )}
      </div>

      {/* Video container */}
      <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative">
        {!inCall && !joining && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={joinCall}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Join Video Call
            </button>
          </div>
        )}
        
        {joining && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Joining call...</p>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
