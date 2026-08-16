// Vercel Serverless Function — POST /api/auth/login
const ADMIN_USERNAME = 'ethiocanada';
const ADMIN_PASSWORD = 'ethiocanadaheadofficer';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { username, password } = req.body || {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    res.status(200).json({ token, user: { username, role: 'admin' } });
    return;
  }

  res.status(401).json({ message: 'Invalid username or password' });
}
