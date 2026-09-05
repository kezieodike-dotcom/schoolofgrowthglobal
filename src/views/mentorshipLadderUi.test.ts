import { readFileSync } from 'node:fs';
import path from 'node:path';

const source = readFileSync(path.join(process.cwd(), 'src', 'views', 'MentorsView.tsx'), 'utf8');

for (const phrase of [
  'tone?: \'consultation\' | \'mentorship\'',
  'tone="consultation"',
  'tone="mentorship"',
  'bg-emerald-50',
  'bg-amber-500',
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Mentorship page should visually distinguish consultation and mentorship ladders: ${phrase}.`);
  }
}
