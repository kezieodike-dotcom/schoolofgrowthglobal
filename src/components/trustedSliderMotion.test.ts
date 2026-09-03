import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const slider = readFileSync(path.join(root, 'components', 'ui', 'infinite-slider.tsx'), 'utf8');
const trusted = readFileSync(path.join(root, 'src', 'components', 'TrustedExecutivesSlider.tsx'), 'utf8');

for (const phrase of [
  "from 'framer-motion'",
  "from 'react-use-measure'",
  'repeat: Infinity',
  'useMotionValue',
  '<motion.div',
  '{children}',
]) {
  if (!slider.includes(phrase)) {
    throw new Error(`InfiniteSlider should restore the trusted-company marquee motion: ${phrase}.`);
  }
}

const childCount = (slider.match(/\{children\}/g) ?? []).length;
if (childCount < 2) {
  throw new Error('InfiniteSlider should render duplicated children for a continuous marquee.');
}

for (const phrase of ['duration={40}', 'gap={64}', 'TrustedExecutivesSlider']) {
  const source = phrase === 'TrustedExecutivesSlider' ? trusted : trusted;
  if (!source.includes(phrase)) {
    throw new Error(`Trusted executives slider should keep marquee configuration: ${phrase}.`);
  }
}
