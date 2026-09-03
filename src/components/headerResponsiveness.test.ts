import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const layout = readFileSync(path.join(root, 'src', 'components', 'Layout.tsx'), 'utf8');
const header = readFileSync(path.join(root, 'src', 'components', 'HeaderNavbar.tsx'), 'utf8');
const adminLayout = readFileSync(path.join(root, 'src', 'views', 'admin', 'AdminLayout.tsx'), 'utf8');

if (layout.includes("behavior: 'smooth'")) {
  throw new Error('Route changes should not smooth-scroll because it makes header navigation feel slow.');
}

if (!layout.includes("behavior: 'auto'")) {
  throw new Error('Route changes should jump immediately after header navigation.');
}

if (!header.includes('z-[80]')) {
  throw new Error('The public header should stack above floating prompts so its links remain clickable.');
}

if (!header.includes('aria-expanded={mobileMenuOpen}')) {
  throw new Error('The mobile menu button should expose its expanded state.');
}

if (!adminLayout.includes('z-[60]') || !adminLayout.includes('z-50')) {
  throw new Error('The admin drawer and mobile header should use explicit stacking for reliable taps.');
}
