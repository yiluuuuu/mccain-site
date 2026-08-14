// Vercel Serverless Function — /api/applicants/[id] (PUT, DELETE)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, '..', '..', 'data', 'applicants.json');

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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract the ID from the URL path: /api/applicants/[id]
  const id = Number(req.query.id);

  if (!id) {
    res.status(400).json({ message: 'Missing applicant ID' });
    return;
  }

  if (req.method === 'PUT') {
    const applicants = readApplicants();
    const index = applicants.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).json({ message: 'Applicant not found' });
      return;
    }

    applicants[index] = { ...applicants[index], ...req.body };
    writeApplicants(applicants);
    res.status(200).json(applicants[index]);
    return;
  }

  if (req.method === 'DELETE') {
    const applicants = readApplicants();
    const nextApplicants = applicants.filter((item) => item.id !== id);

    if (nextApplicants.length === applicants.length) {
      res.status(404).json({ message: 'Applicant not found' });
      return;
    }

    writeApplicants(nextApplicants);
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: 'Method not allowed' });
}
