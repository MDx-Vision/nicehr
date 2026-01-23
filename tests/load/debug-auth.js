import http from 'k6/http';

export default function () {
  // Login
  const loginRes = http.post(
    'http://127.0.0.1:4000/api/auth/login',
    JSON.stringify({ email: 'sarah.chen@nicehr.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  console.log('Login Status:', loginRes.status);
  console.log('Cookies:', JSON.stringify(loginRes.cookies));
  
  // Try dashboard
  const dashRes = http.get('http://127.0.0.1:4000/api/dashboard/stats');
  
  console.log('Dashboard Status:', dashRes.status);
  console.log('Dashboard Body:', dashRes.body);
}
