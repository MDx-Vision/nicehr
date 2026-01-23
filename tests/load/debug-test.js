import http from 'k6/http';

export default function () {
  const res = http.post(
    'http://127.0.0.1:4000/api/auth/login',
    JSON.stringify({ email: 'sarah.chen@nicehr.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  console.log('Error:', res.error);
}
