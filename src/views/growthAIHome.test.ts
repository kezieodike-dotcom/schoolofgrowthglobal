import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./HomeView.tsx', import.meta.url), 'utf8');

if (!source.includes("import { askGrowthAI, describeError } from '../lib/growthAI';")) {
  throw new Error('Home Growth AI should use the shared client.');
}

if (!source.includes('await askGrowthAI({')) {
  throw new Error('Home Growth AI should send prompts through askGrowthAI.');
}

if (!source.includes('setAiAnswer(describeError(err));')) {
  throw new Error('Home Growth AI should show a real failure state when the API is unavailable.');
}

if (source.includes("fetch('/api/ai/chat'")) {
  throw new Error('Home Growth AI should not bypass the shared client with a raw fetch.');
}
