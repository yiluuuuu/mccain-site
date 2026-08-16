import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, 'data', 'applicants.json');

// Admin credentials
const ADMIN_USERNAME = 'ethiocanada';
const ADMIN_PASSWORD = 'ethiocanadaheadofficer';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const ensureDataFile = () => {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
  }
};

const readApplicants = () => {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
};

const writeApplicants = (applicants) => {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(applicants, null, 2));
};

// ── Auth ──────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Simple base64 token — good enough for this use case
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    return res.json({ token, user: { username, role: 'admin' } });
  }
  return res.status(401).json({ message: 'Invalid username or password' });
});

// ── Applicants ────────────────────────────────────────────────────────────
app.get('/api/applicants', (req, res) => {
  res.json(readApplicants());
});

app.post('/api/applicants', (req, res) => {
  const applicants = readApplicants();
  const applicant = {
    id: Date.now(),
    ...req.body,
  };
  applicants.unshift(applicant);
  writeApplicants(applicants);
  res.status(201).json(applicant);
});

app.put('/api/applicants/:id', (req, res) => {
  const applicants = readApplicants();
  const index = applicants.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Applicant not found' });
  }

  applicants[index] = { ...applicants[index], ...req.body };
  writeApplicants(applicants);
  res.json(applicants[index]);
});

app.delete('/api/applicants/:id', (req, res) => {
  const applicants = readApplicants();
  const nextApplicants = applicants.filter((item) => item.id !== Number(req.params.id));

  if (nextApplicants.length === applicants.length) {
    return res.status(404).json({ message: 'Applicant not found' });
  }

  writeApplicants(nextApplicants);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

