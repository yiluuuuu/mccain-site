import { readApplicants, writeApplicants } from '../_db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract ID from query param (from vercel rewrite) or URL path
  let rawId = req.query?.id;
  if (!rawId && req.url) {
    const cleanUrl = req.url.split('?')[0];
    const segments = cleanUrl.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && lastSegment !== 'applicants' && lastSegment !== 'index') {
      rawId = lastSegment;
    }
  }

  const id = rawId ? Number(rawId) : null;

  if (req.method === 'GET') {
    const applicants = readApplicants();
    if (id) {
      const applicant = applicants.find((item) => Number(item.id) === id);
      if (!applicant) {
        res.status(404).json({ message: 'Applicant not found' });
        return;
      }
      res.status(200).json(applicant);
      return;
    }
    res.status(200).json(applicants);
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
    if (!id || isNaN(id)) {
      res.status(400).json({ message: 'Missing or invalid applicant ID' });
      return;
    }

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
    if (!id || isNaN(id)) {
      res.status(400).json({ message: 'Missing or invalid applicant ID' });
      return;
    }

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
