import { readApplicants, writeApplicants } from '../_db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

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

  res.status(405).json({ message: 'Method not allowed' });
}
