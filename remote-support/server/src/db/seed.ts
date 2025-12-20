import db, { users, hospitals, availability, specialties, sessions, preferences, now } from './index.js';

console.log('Seeding database...\n');

// Check if already seeded
if (db.isSeeded()) {
  console.log('Database already seeded. Use resetDb() to reset first.');
  process.exit(0);
}

// Seed hospitals
console.log('Creating hospitals...');
const hospital1 = hospitals.insert({ name: 'Metro General Hospital' });
const hospital2 = hospitals.insert({ name: "St. Mary's Medical Center" });
const hospital3 = hospitals.insert({ name: 'Valley Health System' });

// Seed users
console.log('Creating users...');

// Consultants
const sarah = users.insert({ 
  email: 'sarah.chen@nicehr.com', 
  name: 'Sarah Chen', 
  role: 'consultant', 
  hospital_id: null 
});
const marcus = users.insert({ 
  email: 'marcus.johnson@nicehr.com', 
  name: 'Marcus Johnson', 
  role: 'consultant', 
  hospital_id: null 
});
const emily = users.insert({ 
  email: 'emily.rodriguez@nicehr.com', 
  name: 'Emily Rodriguez', 
  role: 'consultant', 
  hospital_id: null 
});
const david = users.insert({ 
  email: 'david.kim@nicehr.com', 
  name: 'David Kim', 
  role: 'consultant', 
  hospital_id: null 
});

// Hospital Staff - Metro General
const john = users.insert({ 
  email: 'john.smith@metrogeneral.org', 
  name: 'John Smith', 
  role: 'hospital_staff', 
  hospital_id: hospital1.id 
});
const lisa = users.insert({ 
  email: 'lisa.wong@metrogeneral.org', 
  name: 'Lisa Wong', 
  role: 'hospital_staff', 
  hospital_id: hospital1.id 
});
const mike = users.insert({ 
  email: 'mike.brown@metrogeneral.org', 
  name: 'Mike Brown', 
  role: 'hospital_leadership', 
  hospital_id: hospital1.id 
});

// Hospital Staff - St. Mary's
const anna = users.insert({ 
  email: 'anna.garcia@stmarys.org', 
  name: 'Anna Garcia', 
  role: 'hospital_staff', 
  hospital_id: hospital2.id 
});
const james = users.insert({ 
  email: 'james.wilson@stmarys.org', 
  name: 'James Wilson', 
  role: 'hospital_staff', 
  hospital_id: hospital2.id 
});

// Admin
const admin = users.insert({ 
  email: 'admin@nicehr.com', 
  name: 'Admin User', 
  role: 'admin', 
  hospital_id: null 
});

// Seed consultant availability
console.log('Setting consultant availability...');
availability.insert({ consultant_id: sarah.id, status: 'available', sessions_today: 0 });
availability.insert({ consultant_id: marcus.id, status: 'available', sessions_today: 0 });
availability.insert({ consultant_id: emily.id, status: 'busy', sessions_today: 2 });
availability.insert({ consultant_id: david.id, status: 'offline', sessions_today: 0 });

// Seed consultant specialties
console.log('Setting consultant specialties...');
// Sarah Chen - ER expert, Pharmacy standard
specialties.insert({ consultant_id: sarah.id, department: 'ER', proficiency: 'expert' });
specialties.insert({ consultant_id: sarah.id, department: 'Pharmacy', proficiency: 'standard' });

// Marcus Johnson - Radiology expert, Lab standard
specialties.insert({ consultant_id: marcus.id, department: 'Radiology', proficiency: 'expert' });
specialties.insert({ consultant_id: marcus.id, department: 'Lab', proficiency: 'standard' });

// Emily Rodriguez - Pharmacy expert, ER standard
specialties.insert({ consultant_id: emily.id, department: 'Pharmacy', proficiency: 'expert' });
specialties.insert({ consultant_id: emily.id, department: 'ER', proficiency: 'standard' });

// David Kim - IT/Build expert
specialties.insert({ consultant_id: david.id, department: 'IT', proficiency: 'expert' });
specialties.insert({ consultant_id: david.id, department: 'Build', proficiency: 'expert' });

// Seed sample past sessions
console.log('Creating sample past sessions...');
sessions.insert({
  hospital_id: hospital1.id,
  requester_id: john.id,
  consultant_id: sarah.id,
  department: 'ER',
  status: 'completed',
  issue_summary: 'Patient registration workflow issue',
  resolution_notes: 'Reconfigured workflow order, tested successfully',
  started_at: '2024-12-10T09:30:00.000Z',
  ended_at: '2024-12-10T09:45:00.000Z',
  duration_seconds: 900,
  rating: 5,
  feedback: 'Sarah was extremely helpful!'
});

sessions.insert({
  hospital_id: hospital1.id,
  requester_id: john.id,
  consultant_id: sarah.id,
  department: 'ER',
  status: 'completed',
  issue_summary: 'Medication reconciliation form not loading',
  resolution_notes: 'Cache cleared, form loading correctly',
  started_at: '2024-12-15T14:00:00.000Z',
  ended_at: '2024-12-15T14:20:00.000Z',
  duration_seconds: 1200,
  rating: 5,
  feedback: 'Quick resolution as always'
});

sessions.insert({
  hospital_id: hospital2.id,
  requester_id: anna.id,
  consultant_id: marcus.id,
  department: 'Radiology',
  status: 'completed',
  issue_summary: 'PACS integration showing duplicate images',
  resolution_notes: 'Adjusted HL7 message parsing rules',
  started_at: '2024-12-12T11:00:00.000Z',
  ended_at: '2024-12-12T11:35:00.000Z',
  duration_seconds: 2100,
  rating: 4,
  feedback: 'Good help, took a bit to diagnose'
});

// Seed staff-consultant preferences
console.log('Setting up staff-consultant relationships...');
preferences.upsert(john.id, sarah.id, {
  successful_sessions: 2,
  avg_rating: 5.0,
  last_session_at: '2024-12-15T14:20:00.000Z'
});

preferences.upsert(anna.id, marcus.id, {
  successful_sessions: 1,
  avg_rating: 4.0,
  last_session_at: '2024-12-12T11:35:00.000Z'
});

console.log('\n✅ Database seeded successfully!');
console.log('\nTest accounts:');
console.log('─────────────────────────────────────────');
console.log('CONSULTANTS:');
console.log('  sarah.chen@nicehr.com (ER expert, Available)');
console.log('  marcus.johnson@nicehr.com (Radiology expert, Available)');
console.log('  emily.rodriguez@nicehr.com (Pharmacy expert, Busy)');
console.log('  david.kim@nicehr.com (IT/Build expert, Offline)');
console.log('');
console.log('HOSPITAL STAFF:');
console.log('  john.smith@metrogeneral.org (Metro General)');
console.log('  lisa.wong@metrogeneral.org (Metro General)');
console.log('  anna.garcia@stmarys.org (St. Mary\'s)');
console.log('');
console.log('ADMIN:');
console.log('  admin@nicehr.com');
console.log('─────────────────────────────────────────');
