import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FORMS } from '../lib/formDefs.js';

const formKeys = Object.keys(FORMS).sort();
const leadStoreSource = readFileSync(resolve('src/server/leadStore.ts'), 'utf8');
const leadRoutesSource = readFileSync(resolve('src/server/leadRoutes.ts'), 'utf8');

const storedLeadSources = Array.from(
  leadStoreSource.matchAll(/\|\s+"([^"]+)"/g),
  (match) => match[1]
).sort();
const routeLeadSources = Array.from(
  leadRoutesSource.matchAll(/"([^"]+)",/g),
  (match) => match[1]
).filter((source) => formKeys.includes(source)).sort();

if (formKeys.length !== storedLeadSources.length) {
  throw new Error(
    `Every public form must be accepted by lead capture. Forms: ${formKeys.join(
      ', '
    )}. Stored lead sources: ${storedLeadSources.join(', ')}.`
  );
}

if (formKeys.length !== routeLeadSources.length) {
  throw new Error(
    `Every public form must be accepted by /api/leads. Forms: ${formKeys.join(
      ', '
    )}. Route lead sources: ${routeLeadSources.join(', ')}.`
  );
}

for (const key of formKeys) {
  if (!storedLeadSources.includes(key)) {
    throw new Error(`Stored lead type does not accept the ${key} form.`);
  }
  if (!routeLeadSources.includes(key)) {
    throw new Error(`/api/leads does not accept the ${key} form.`);
  }
}
