import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const register = readFileSync(path.join(root, 'src/views/RegisterView.tsx'), 'utf8');
const app = readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const mentorRegistration = readFileSync(path.join(root, 'src/views/MentorRegistrationView.tsx'), 'utf8');
const formDefs = readFileSync(path.join(root, 'src/lib/formDefs.ts'), 'utf8');

if (!register.includes('to="/register/consultant"')) throw new Error('Registration switcher is missing the consultant path.');
if (!app.includes('path="register/consultant"')) throw new Error('Consultant registration route is missing.');
if (!mentorRegistration.includes('isConsultant')) throw new Error('Shared onboarding form is not configured for consultant mode.');
if (!formDefs.includes('consultant:')) throw new Error('Consultant submissions are not defined as a form source.');
