import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let seedApplicants = [];
try {
  seedApplicants = require('../backend/data/applicants.json');
} catch (e) {
  seedApplicants = [];
}

const tmpDataFile = path.join('/tmp', 'applicants.json');

export const readApplicants = () => {
  try {
    if (fs.existsSync(tmpDataFile)) {
      return JSON.parse(fs.readFileSync(tmpDataFile, 'utf8'));
    }
    try {
      fs.writeFileSync(tmpDataFile, JSON.stringify(seedApplicants, null, 2));
    } catch (e) {
      // Ignore write errors
    }
    return seedApplicants;
  } catch (err) {
    console.error('Error reading applicants data:', err);
  }
  return seedApplicants || [];
};

export const writeApplicants = (applicants) => {
  try {
    fs.writeFileSync(tmpDataFile, JSON.stringify(applicants, null, 2));
  } catch (err) {
    console.error('Error writing applicants data:', err);
  }
};
