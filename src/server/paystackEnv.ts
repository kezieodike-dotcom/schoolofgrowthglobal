function cleanEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

export function paystackSecretKey(): string | undefined {
  return cleanEnvValue(process.env.PAYSTACK_SECRET_KEY);
}

export function paystackPublicKey(): string | undefined {
  return cleanEnvValue(process.env.PAYSTACK_PUBLIC_KEY);
}

export function isPaystackConfigured(): boolean {
  return Boolean(paystackSecretKey());
}
