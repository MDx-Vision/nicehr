import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
const dbPath = path.resolve(dataDir, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database structure
interface Database {
  users: User[];
  hospitals: Hospital[];
  support_sessions: SupportSession[];
  consultant_availability: ConsultantAvailability[];
  consultant_specialties: ConsultantSpecialty[];
  support_queue: QueueItem[];
  staff_consultant_preferences: StaffConsultantPreference[];
  support_session_events: SessionEvent[];
  _autoIncrement: Record<string, number>;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'consultant' | 'hospital_staff' | 'hospital_leadership';
  hospital_id: number | null;
  created_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  created_at: string;
}

export interface SupportSession {
  id: number;
  hospital_id: number;
  requester_id: number;
  consultant_id: number | null;
  department: string;
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'pending' | 'connecting' | 'active' | 'completed' | 'cancelled' | 'escalated';
  daily_room_name: string | null;
  daily_room_url: string | null;
  issue_summary: string;
  resolution_notes: string | null;
  started_at: string | null;
  ended_at: string | null;
  wait_time_seconds: number | null;
  duration_seconds: number | null;
  rating: number | null;
  feedback: string | null;
  auto_cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultantAvailability {
  id: number;
  consultant_id: number;
  status: 'online' | 'available' | 'busy' | 'away' | 'offline';
  current_session_id: number | null;
  sessions_today: number;
  last_session_ended_at: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultantSpecialty {
  id: number;
  consultant_id: number;
  department: string;
  proficiency: 'standard' | 'expert';
  created_at: string;
}

export interface QueueItem {
  id: number;
  session_id: number;
  position: number;
  created_at: string;
}

export interface StaffConsultantPreference {
  id: number;
  staff_id: number;
  consultant_id: number;
  successful_sessions: number;
  avg_rating: number | null;
  last_session_at: string | null;
  created_at: string;
}

export interface SessionEvent {
  id: number;
  session_id: number;
  event_type: string;
  actor_id: number | null;
  metadata: string | null;
  created_at: string;
}

// Initialize empty database
const emptyDb: Database = {
  users: [],
  hospitals: [],
  support_sessions: [],
  consultant_availability: [],
  consultant_specialties: [],
  support_queue: [],
  staff_consultant_preferences: [],
  support_session_events: [],
  _autoIncrement: {
    users: 1,
    hospitals: 1,
    support_sessions: 1,
    consultant_availability: 1,
    consultant_specialties: 1,
    support_queue: 1,
    staff_consultant_preferences: 1,
    support_session_events: 1,
  },
};

// Load or create database
function loadDb(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading database:', err);
  }
  return { ...emptyDb };
}

function saveDb(data: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// In-memory database
let db = loadDb();

// Helper functions
export function getNextId(table: keyof Omit<Database, '_autoIncrement'>): number {
  const id = db._autoIncrement[table] || 1;
  db._autoIncrement[table] = id + 1;
  saveDb(db);
  return id;
}

export function now(): string {
  return new Date().toISOString();
}

// Table accessors
export const users = {
  getAll: () => db.users,
  getById: (id: number) => db.users.find(u => u.id === id),
  getByEmail: (email: string) => db.users.find(u => u.email === email),
  getByRole: (role: string) => db.users.filter(u => u.role === role),
  insert: (user: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      ...user,
      id: getNextId('users'),
      created_at: now(),
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },
};

export const hospitals = {
  getAll: () => db.hospitals,
  getById: (id: number) => db.hospitals.find(h => h.id === id),
  insert: (hospital: Omit<Hospital, 'id' | 'created_at'>) => {
    const newHospital: Hospital = {
      ...hospital,
      id: getNextId('hospitals'),
      created_at: now(),
    };
    db.hospitals.push(newHospital);
    saveDb(db);
    return newHospital;
  },
};

export const sessions = {
  getAll: () => db.support_sessions,
  getById: (id: number) => db.support_sessions.find(s => s.id === id),
  getByStatus: (status: SupportSession['status']) => db.support_sessions.filter(s => s.status === status),
  getActive: (userId: number) => db.support_sessions.find(
    s => (s.requester_id === userId || s.consultant_id === userId) && 
         ['pending', 'connecting', 'active'].includes(s.status)
  ),
  insert: (session: Partial<SupportSession>) => {
    const newSession: SupportSession = {
      id: getNextId('support_sessions'),
      hospital_id: session.hospital_id!,
      requester_id: session.requester_id!,
      consultant_id: session.consultant_id || null,
      department: session.department || '',
      urgency: session.urgency || 'normal',
      status: session.status || 'pending',
      daily_room_name: session.daily_room_name || null,
      daily_room_url: session.daily_room_url || null,
      issue_summary: session.issue_summary || '',
      resolution_notes: session.resolution_notes || null,
      started_at: session.started_at || null,
      ended_at: session.ended_at || null,
      wait_time_seconds: session.wait_time_seconds || null,
      duration_seconds: session.duration_seconds || null,
      rating: session.rating || null,
      feedback: session.feedback || null,
      auto_cancelled_reason: session.auto_cancelled_reason || null,
      created_at: now(),
      updated_at: now(),
    };
    db.support_sessions.push(newSession);
    saveDb(db);
    return newSession;
  },
  update: (id: number, updates: Partial<SupportSession>) => {
    const index = db.support_sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      db.support_sessions[index] = { 
        ...db.support_sessions[index], 
        ...updates, 
        updated_at: now() 
      };
      saveDb(db);
      return db.support_sessions[index];
    }
    return null;
  },
  getHistory: (userId: number, role: string, limit: number) => {
    let filtered = db.support_sessions.filter(
      s => ['completed', 'cancelled', 'escalated'].includes(s.status)
    );
    if (role !== 'admin' && role !== 'hospital_leadership') {
      filtered = filtered.filter(s => s.requester_id === userId || s.consultant_id === userId);
    }
    return filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, limit);
  },
  getRecentCompleted: (limit: number) => {
    return db.support_sessions
      .filter(s => s.status === 'completed' && s.wait_time_seconds !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },
};

export const availability = {
  getAll: () => db.consultant_availability,
  getByConsultantId: (id: number) => db.consultant_availability.find(a => a.consultant_id === id),
  getAvailable: () => db.consultant_availability.filter(a => a.status === 'available'),
  insert: (avail: Partial<ConsultantAvailability>) => {
    const newAvail: ConsultantAvailability = {
      id: getNextId('consultant_availability'),
      consultant_id: avail.consultant_id!,
      status: avail.status || 'offline',
      current_session_id: avail.current_session_id || null,
      sessions_today: avail.sessions_today || 0,
      last_session_ended_at: avail.last_session_ended_at || null,
      last_seen_at: now(),
      created_at: now(),
      updated_at: now(),
    };
    db.consultant_availability.push(newAvail);
    saveDb(db);
    return newAvail;
  },
  update: (consultantId: number, updates: Partial<ConsultantAvailability>) => {
    const index = db.consultant_availability.findIndex(a => a.consultant_id === consultantId);
    if (index !== -1) {
      db.consultant_availability[index] = { 
        ...db.consultant_availability[index], 
        ...updates, 
        updated_at: now() 
      };
      saveDb(db);
      return db.consultant_availability[index];
    }
    return null;
  },
};

export const specialties = {
  getAll: () => db.consultant_specialties,
  getByConsultantId: (id: number) => db.consultant_specialties.filter(s => s.consultant_id === id),
  getByDepartment: (consultantId: number, department: string) => 
    db.consultant_specialties.find(s => s.consultant_id === consultantId && s.department === department),
  deleteByConsultantId: (id: number) => {
    db.consultant_specialties = db.consultant_specialties.filter(s => s.consultant_id !== id);
    saveDb(db);
  },
  insert: (specialty: Partial<ConsultantSpecialty>) => {
    const newSpecialty: ConsultantSpecialty = {
      id: getNextId('consultant_specialties'),
      consultant_id: specialty.consultant_id!,
      department: specialty.department!,
      proficiency: specialty.proficiency || 'standard',
      created_at: now(),
    };
    db.consultant_specialties.push(newSpecialty);
    saveDb(db);
    return newSpecialty;
  },
};

export const queue = {
  getAll: () => db.support_queue.sort((a, b) => a.position - b.position),
  getBySessionId: (sessionId: number) => db.support_queue.find(q => q.session_id === sessionId),
  getMaxPosition: () => Math.max(0, ...db.support_queue.map(q => q.position)),
  insert: (item: Partial<QueueItem>) => {
    const newItem: QueueItem = {
      id: getNextId('support_queue'),
      session_id: item.session_id!,
      position: item.position || queue.getMaxPosition() + 1,
      created_at: now(),
    };
    db.support_queue.push(newItem);
    saveDb(db);
    return newItem;
  },
  delete: (sessionId: number) => {
    db.support_queue = db.support_queue.filter(q => q.session_id !== sessionId);
    saveDb(db);
  },
};

export const preferences = {
  get: (staffId: number, consultantId: number) => 
    db.staff_consultant_preferences.find(p => p.staff_id === staffId && p.consultant_id === consultantId),
  upsert: (staffId: number, consultantId: number, updates: Partial<StaffConsultantPreference>) => {
    const existing = preferences.get(staffId, consultantId);
    if (existing) {
      const index = db.staff_consultant_preferences.findIndex(
        p => p.staff_id === staffId && p.consultant_id === consultantId
      );
      db.staff_consultant_preferences[index] = { ...existing, ...updates };
      saveDb(db);
      return db.staff_consultant_preferences[index];
    } else {
      const newPref: StaffConsultantPreference = {
        id: getNextId('staff_consultant_preferences'),
        staff_id: staffId,
        consultant_id: consultantId,
        successful_sessions: updates.successful_sessions || 1,
        avg_rating: updates.avg_rating || null,
        last_session_at: updates.last_session_at || now(),
        created_at: now(),
      };
      db.staff_consultant_preferences.push(newPref);
      saveDb(db);
      return newPref;
    }
  },
};

export const events = {
  insert: (event: Partial<SessionEvent>) => {
    const newEvent: SessionEvent = {
      id: getNextId('support_session_events'),
      session_id: event.session_id!,
      event_type: event.event_type!,
      actor_id: event.actor_id || null,
      metadata: event.metadata || null,
      created_at: now(),
    };
    db.support_session_events.push(newEvent);
    saveDb(db);
    return newEvent;
  },
};

// Check if database has been seeded
export function isSeeded(): boolean {
  return db.users.length > 0;
}

// Reset database
export function resetDb(): void {
  db = { ...emptyDb };
  saveDb(db);
}

export default {
  users,
  hospitals,
  sessions,
  availability,
  specialties,
  queue,
  preferences,
  events,
  isSeeded,
  resetDb,
};
