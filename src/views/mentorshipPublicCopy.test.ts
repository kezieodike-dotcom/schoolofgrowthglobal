import { readFileSync } from 'fs';
import path from 'path';

const source = readFileSync(path.join(process.cwd(), 'src', 'views', 'MentorsView.tsx'), 'utf8');

if (!source.includes('Find the Right Guidance &') || !source.includes('Growth Expert You Need')) {
  throw new Error('Mentorship hero should use the updated guidance and growth expert headline.');
}

if (!source.includes('Every season of life, career, and business comes with different questions.')) {
  throw new Error('Mentorship hero should use the updated explanatory subtitle.');
}

if (!source.includes("Not sure which option is right for you?")) {
  throw new Error('Mentorship hero should invite visitors to start with a conversation.');
}

if (source.includes('Find the Right{')) {
  throw new Error('Remove the old split mentorship hero headline.');
}

if (!source.includes("Tell Us Where You Are. We'll Help You Discover Where to Go Next.")) {
  throw new Error('Mentorship page should use the updated guidance headline.');
}

if (source.includes('Clients should not struggle to know what to buy.')) {
  throw new Error('Remove the old buying-focused mentorship headline from the public page.');
}

if (source.includes('Experts receive {REVENUE_SPLIT.expertPercent}% of paid consultation or mentorship')) {
  throw new Error('Do not show the expert revenue split inside the public consultation request modal.');
}
