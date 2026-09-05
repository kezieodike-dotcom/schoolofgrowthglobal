import {
  COUNTRY_CODES,
  countryFlagEmoji,
  defaultCountryCode,
  formatPhoneWithCountryCode,
} from './countryCodes.js';

if (COUNTRY_CODES.length < 230) {
  throw new Error(`Country code selector should include all countries, found only ${COUNTRY_CODES.length}.`);
}

const nigeria = COUNTRY_CODES.find((country) => country.iso === 'NG');
if (!nigeria || nigeria.dialCode !== '+234' || nigeria.flag !== 'NG') {
  throw new Error('Country code selector should include Nigeria with +234 and NG flag code.');
}

const unitedKingdom = COUNTRY_CODES.find((country) => country.iso === 'GB');
if (!unitedKingdom || unitedKingdom.dialCode !== '+44' || unitedKingdom.flag !== 'GB') {
  throw new Error('Country code selector should include United Kingdom with +44 and GB flag code.');
}

if (defaultCountryCode.iso !== 'NG') {
  throw new Error('Nigeria should remain the default phone country.');
}

if (formatPhoneWithCountryCode('+234', '08012345678') !== '+234 8012345678') {
  throw new Error('Phone formatter should combine the selected code with the local number.');
}

const expectedCountries = [
  ['IN', '+91', 'India'],
  ['CN', '+86', 'China'],
  ['BR', '+55', 'Brazil'],
  ['FR', '+33', 'France'],
  ['DE', '+49', 'Germany'],
  ['AE', '+971', 'United Arab Emirates'],
] as const;

for (const [iso, dialCode, name] of expectedCountries) {
  const match = COUNTRY_CODES.find((country) => country.iso === iso);
  if (!match || match.dialCode !== dialCode || match.name !== name) {
    throw new Error(`Country code selector should include ${name} with ${dialCode}.`);
  }
}

if (countryFlagEmoji('NG') !== '🇳🇬' || countryFlagEmoji('GB') !== '🇬🇧') {
  throw new Error('Country code selector should render real country flag colours.');
}
