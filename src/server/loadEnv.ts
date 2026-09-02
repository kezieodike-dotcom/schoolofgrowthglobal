import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'dotenv';

type MutableEnv = Record<string, string | undefined>;

/**
 * Standalone Express/tsx does not automatically load `.env.local`.
 * Load `.env` first, then `.env.local`, while preserving real shell/Vercel
 * variables that were already present before file loading began.
 */
export function loadServerEnv(cwd = process.cwd(), env: MutableEnv = process.env): void {
  const protectedKeys = new Set(Object.keys(env));

  for (const file of ['.env', '.env.local']) {
    const path = join(cwd, file);
    if (!existsSync(path)) continue;

    const values = parse(readFileSync(path));
    for (const [key, value] of Object.entries(values)) {
      if (protectedKeys.has(key)) continue;
      env[key] = value;
    }
  }
}
