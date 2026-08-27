function stripEnvAssignment(name: string, value: string): string {
  const trimmed = value.trim();
  const prefix = `${name}=`;
  return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length).trim() : trimmed;
}

export function readSupabaseEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const cleaned = stripEnvAssignment(name, value);
  return cleaned || undefined;
}

export function readSupabaseEnvWithDefault(name: string, fallback: string): string {
  return readSupabaseEnv(name) ?? fallback;
}

export function normalizeSupabaseUrl(value: string): string {
  return value.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}
