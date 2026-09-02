import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadServerEnv } from './loadEnv.js';

const dir = mkdtempSync(join(tmpdir(), 'sogg-env-'));

try {
  writeFileSync(join(dir, '.env'), 'ADMIN_PASSWORD=from-env\nPORT=3000\n');
  writeFileSync(join(dir, '.env.local'), 'ADMIN_PASSWORD=from-local\nPAYSTACK_SECRET_KEY=local-secret\n');

  const env: Record<string, string | undefined> = {
    PORT: '9000',
  };

  loadServerEnv(dir, env);

  if (env.ADMIN_PASSWORD !== 'from-local') {
    throw new Error(`Expected .env.local to set ADMIN_PASSWORD, got ${env.ADMIN_PASSWORD}.`);
  }

  if (env.PAYSTACK_SECRET_KEY !== 'local-secret') {
    throw new Error('Expected .env.local-only values to load.');
  }

  if (env.PORT !== '9000') {
    throw new Error('Existing environment values must not be overwritten by env files.');
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
