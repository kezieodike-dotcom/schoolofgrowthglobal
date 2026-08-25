import { readFileSync } from 'fs';
import path from 'path';

const demoReviewerAccess = readFileSync(
  path.join(process.cwd(), 'src', 'lib', 'demoReviewerAccess.ts'),
  'utf8'
);

if (!demoReviewerAccess.includes("from './pricing.js'")) {
  throw new Error('Server-imported shared modules must use Node ESM .js import specifiers.');
}
