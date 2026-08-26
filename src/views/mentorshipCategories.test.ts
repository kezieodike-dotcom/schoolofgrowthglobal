import { readFileSync } from 'fs';
import path from 'path';

const source = readFileSync(path.join(process.cwd(), 'src', 'views', 'MentorsView.tsx'), 'utf8');

for (const label of ['Beauty & Fitness', 'Health, Diet & Well-Being']) {
  if (!source.includes(`title: '${label}'`)) {
    throw new Error(`Mentorship category missing: ${label}`);
  }
}
