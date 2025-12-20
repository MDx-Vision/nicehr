import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/Layout';
import UserSelector from './components/UserSelector';
import RequestSupport from './pages/support/RequestSupport';
import SupportQueue from './pages/support/SupportQueue';
import VideoCall from './pages/support/VideoCall';
import SupportHistory from './pages/support/SupportHistory';
import ConsultantSettings from './pages/support/ConsultantSettings';
import StaffPreferences from './pages/support/StaffPreferences';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import { initGlobalWebSocket, closeGlobalWebSocket } from './hooks/useWebSocket';

// User type
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'consultant' | 'hospital_staff' | 'hospital_leadership';
  hospitalId: number | null;
  hospitalName: string | null;
}

// Auth context
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('support_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('support_user', JSON.stringify(user));
      // Initialize WebSocket connection
      initGlobalWebSocket(user.id, user.role, user.hospitalId ?? undefined);
    } else {
      localStorage.removeItem('support_user');
      closeGlobalWebSocket();
    }
  }, [user]);

  const logout = () => {
    closeGlobalWebSocket();
    setUser(null);
  };

  // If no user, show selector
  if (!user) {
    return <UserSelector onSelect={setUser} />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/support/request" element={<RequestSupport />} />
          <Route path="/support/queue" element={<SupportQueue />} />
          <Route path="/support/call/:sessionId" element={<VideoCall />} />
          <Route path="/support/history" element={<SupportHistory />} />
          <Route path="/support/settings" element={<ConsultantSettings />} />
          <Route path="/support/preferences" element={<StaffPreferences />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  );
}

export default App;
