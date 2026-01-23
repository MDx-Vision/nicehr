import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://127.0.0.1:4000';

const TEST_USERS = [
  'sarah.chen@nicehr.com',
  'michael.rodriguez@nicehr.com',
  'admin@mercyregional.org',
];

export default function () {
  const email = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  
  // 1. LOGIN
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: email, password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  // Get cookies from response
  const jar = http.cookieJar();
  
  sleep(0.5);

  // 2. DASHBOARD
  const dashRes = http.get(`${BASE_URL}/api/dashboard/stats`);
  check(dashRes, {
    'dashboard loads': (r) => r.status === 200,
  });

  sleep(0.5);

  // 3. CONSULTANTS
  const consultantsRes = http.get(`${BASE_URL}/api/consultants`);
  check(consultantsRes, {
    'consultants list loads': (r) => r.status === 200,
  });

  sleep(0.5);

  // 4. SEARCH
  const searchRes = http.get(`${BASE_URL}/api/consultants/search?q=nurse`);
  check(searchRes, {
    'search works': (r) => r.status === 200,
  });

  sleep(0.5);

  // 5. HOSPITALS
  const hospitalsRes = http.get(`${BASE_URL}/api/hospitals`);
  check(hospitalsRes, {
    'hospitals list loads': (r) => r.status === 200,
  });

  sleep(0.5);
}
