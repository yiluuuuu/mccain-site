import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, '..', 'data', 'applicants.json');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(readApplicants());
    return;
  }

  if (req.method === 'POST') {
    const applicants = readApplicants();
    const applicant = { id: Date.now(), ...req.body };
    applicants.unshift(applicant);
    writeApplicants(applicants);
    res.status(201).json(applicant);
    return;
  }

  if (req.method === 'PUT') {
    const applicants = readApplicants();
    const id = Number(req.query.id || req.body?.id);
    const index = applicants.findIndex((item) => Number(item.id) === id);

    if (index === -1) {
      res.status(404).json({ message: 'Applicant not found' });
      return;
    }

    const existingPhoto = applicants[index].photo || applicants[index].profilePhoto || '';
    const newPhoto = (req.body.photo !== undefined && req.body.photo !== null && req.body.photo !== '')
      ? req.body.photo
      : (req.body.profilePhoto !== undefined && req.body.profilePhoto !== null && req.body.profilePhoto !== '')
      ? req.body.profilePhoto
      : existingPhoto;

    const updatedItem = {
      ...applicants[index],
      ...req.body,
      photo: newPhoto,
      profilePhoto: newPhoto,
      id: applicants[index].id,
    };

    applicants[index] = updatedItem;
    writeApplicants(applicants);
    res.status(200).json(updatedItem);
    return;
  }

  if (req.method === 'DELETE') {
    const applicants = readApplicants();
    const id = Number(req.query.id);
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
