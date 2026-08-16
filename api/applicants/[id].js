import { readApplicants, writeApplicants } from '../_db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract ID from query parameter or fallback to request URL path
  let rawId = req.query?.id;
  if (!rawId && req.url) {
    const cleanUrl = req.url.split('?')[0];
    const segments = cleanUrl.split('/');
    rawId = segments[segments.length - 1];
  }

  const id = Number(rawId);

  if (!id || isNaN(id)) {
    res.status(400).json({ message: 'Missing or invalid applicant ID' });
    return;
  }

  if (req.method === 'PUT') {
    const applicants = readApplicants();
    const index = applicants.findIndex((item) => Number(item.id) === id);

    if (index === -1) {
      res.status(404).json({ message: 'Applicant not found' });
      return;
    }

    const updatedItem = { ...applicants[index], ...req.body, id: applicants[index].id };
    applicants[index] = updatedItem;
    writeApplicants(applicants);
    res.status(200).json(updatedItem);
    return;
  }

  if (req.method === 'DELETE') {
    const applicants = readApplicants();
    const nextApplicants = applicants.filter((item) => Number(item.id) !== id);

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
