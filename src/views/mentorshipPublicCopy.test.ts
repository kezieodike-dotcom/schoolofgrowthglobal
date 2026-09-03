import { readFileSync } from 'fs';
import path from 'path';

const source = readFileSync(path.join(process.cwd(), 'src', 'views', 'MentorsView.tsx'), 'utf8');

if (!source.includes("Tell Us Where You Are. We'll Help You Discover Where to Go Next.")) {
  throw new Error('Mentorship page should use the updated guidance headline.');
}

if (source.includes('Clients should not struggle to know what to buy.')) {
  throw new Error('Remove the old buying-focused mentorship headline from the public page.');
}

if (source.includes('Experts receive {REVENUE_SPLIT.expertPercent}% of paid consultation or mentorship')) {
  throw new Error('Do not show the expert revenue split inside the public consultation request modal.');
}
