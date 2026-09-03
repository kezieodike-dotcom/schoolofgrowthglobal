import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const app = readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
const header = readFileSync(path.join(root, 'src', 'components', 'HeaderNavbar.tsx'), 'utf8');
const layout = readFileSync(path.join(root, 'src', 'components', 'Layout.tsx'), 'utf8');
const widget = readFileSync(path.join(root, 'src', 'components', 'GrowthAIFloatingWidget.tsx'), 'utf8');

if (existsSync(path.join(root, 'src', 'views', 'GrowthAIView.tsx'))) {
  throw new Error('Growth AI should use the floating console, not a separate page.');
}

if (app.includes('GrowthAIView') || app.includes('path="growth-ai"')) {
  throw new Error('App should not register a separate /growth-ai route.');
}

if (header.includes("'/growth-ai'") || header.includes('Growth AI')) {
  throw new Error('Header navigation should not include a separate Growth AI page.');
}

if (layout.includes("pathname.startsWith('/growth-ai')") || layout.includes('isGrowthAI')) {
  throw new Error('Layout should show the floating Growth AI console across public pages.');
}

if (!widget.includes('setIsOpen(true)')) {
  throw new Error('Floating Growth AI CTA should open the original console overlay.');
}

if (widget.includes("navigate('/growth-ai')")) {
  throw new Error('Floating Growth AI CTA should not navigate to a separate page.');
}

for (const phrase of [
  'Back to site',
  'aria-label="Back to main site"',
  "z-[120]",
  'popstate',
  "window.history.pushState({ growthAI: true }",
]) {
  if (!widget.includes(phrase)) {
    throw new Error(`Growth AI overlay should provide a reliable way back to the site: ${phrase}.`);
  }
}
