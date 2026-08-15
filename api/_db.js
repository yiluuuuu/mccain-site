import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDataFile = path.join('/tmp', 'applicants.json');
const seedDataFile = path.join(__dirname, '..', 'backend', 'data', 'applicants.json');

export const readApplicants = () => {
  try {
    if (fs.existsSync(tmpDataFile)) {
      return JSON.parse(fs.readFileSync(tmpDataFile, 'utf8'));
    }
    if (fs.existsSync(seedDataFile)) {
      const data = JSON.parse(fs.readFileSync(seedDataFile, 'utf8'));
      try {
        fs.writeFileSync(tmpDataFile, JSON.stringify(data, null, 2));
      } catch (e) {
        // Ignore writable check errors
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading applicants data:', err);
  }
  return [];
};

export const writeApplicants = (applicants) => {
  try {
    fs.writeFileSync(tmpDataFile, JSON.stringify(applicants, null, 2));
  } catch (err) {
    console.error('Error writing applicants data:', err);
  }
};
