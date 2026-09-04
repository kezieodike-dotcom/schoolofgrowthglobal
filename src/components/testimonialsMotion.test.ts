import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const section = readFileSync(path.join(root, 'src', 'components', 'TestimonialsSection.tsx'), 'utf8');
const columns = readFileSync(path.join(root, 'components', 'ui', 'testimonials-columns-1.tsx'), 'utf8');

for (const marker of ['duration={18}', 'duration={20}', 'duration={22}']) {
  if (!section.includes(marker)) {
    throw new Error(`TestimonialsSection should use staggered vertical column speed ${marker}.`);
  }
}

for (const marker of [
  "from 'motion/react'",
  'useReducedMotion',
  '<motion.div',
  '<motion.article',
  'translateY: "-50%"',
  'repeat: Infinity',
  "ease: 'linear'",
  'whileHover',
  'whileFocus',
  "type: 'spring'",
  'stiffness: 360',
  'damping: 22',
]) {
  if (!columns.includes(marker)) {
    throw new Error(`TestimonialsColumn should implement vertical testimonial motion: ${marker}.`);
  }
}
