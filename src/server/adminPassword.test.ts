import { adminPasswordMatches } from './adminRoutes.js';

if (!adminPasswordMatches('brightyjohnnie@gmail.com', 'brightyjohnnie@gmail.com')) {
  throw new Error('The exact configured admin password should match.');
}

if (!adminPasswordMatches(' brightyjohnnie@gmail.com ', 'brightyjohnnie@gmail.com')) {
  throw new Error('Admin login should tolerate spaces accidentally pasted around the password.');
}

if (adminPasswordMatches('wrong-password', 'brightyjohnnie@gmail.com')) {
  throw new Error('Wrong admin passwords must not match.');
}
