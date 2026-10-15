import { createRequire } from 'module';
import { get, put } from '@vercel/blob';

const require = createRequire(import.meta.url);
let seedApplicants = [];
try {
  seedApplicants = require('../backend/data/applicants.json');
} catch (e) {
  seedApplicants = [];
}

const blobPathname = 'applicants.json';

export const readApplicants = async () => {
  const blob = await get(blobPathname, {
    access: 'public',
    useCache: false,
  });

  if (blob) {
    if (blob.statusCode !== 200 || !blob.stream) {
      throw new Error(`Could not read applicant data (${blob.statusCode})`);
    }
    return JSON.parse(await new Response(blob.stream).text());
  }

  await writeApplicants(seedApplicants);
  return seedApplicants;
};

export const writeApplicants = async (applicants) => {
  await put(blobPathname, JSON.stringify(applicants), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
};
