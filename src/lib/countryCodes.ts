export interface CountryCodeOption {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { iso: 'NG', name: 'Nigeria', dialCode: '+234', flag: 'NG' },
  { iso: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'GB' },
  { iso: 'US', name: 'United States', dialCode: '+1', flag: 'US' },
  { iso: 'GH', name: 'Ghana', dialCode: '+233', flag: 'GH' },
  { iso: 'CA', name: 'Canada', dialCode: '+1', flag: 'CA' },
  { iso: 'ZA', name: 'South Africa', dialCode: '+27', flag: 'ZA' },
  { iso: 'KE', name: 'Kenya', dialCode: '+254', flag: 'KE' },
  { iso: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: 'AE' },
];

export const defaultCountryCode = COUNTRY_CODES[0];

export function formatPhoneWithCountryCode(dialCode: string, phone: string): string {
  const cleanCode = dialCode.trim();
  const cleanPhone = phone.trim().replace(/^[+0\s-]+/, '').replace(/\s+/g, '');
  if (!cleanPhone) return cleanCode;
  return `${cleanCode} ${cleanPhone}`;
}

