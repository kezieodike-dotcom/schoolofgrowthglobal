import { readFileSync } from 'fs';
import path from 'path';

const source = readFileSync(
  path.join(process.cwd(), 'src', 'views', 'admin', 'AdminLoginView.tsx'),
  'utf8'
);

if (!source.includes('showPassword')) {
  throw new Error('Admin login should keep state for showing and hiding the password.');
}

if (!source.includes('Eye') || !source.includes('EyeOff')) {
  throw new Error('Admin login should render eye icons for password visibility.');
}

if (!source.includes('aria-label={showPassword ?')) {
  throw new Error('The password visibility button should have an accessible label.');
}
