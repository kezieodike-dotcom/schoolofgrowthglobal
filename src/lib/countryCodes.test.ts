import {
  COUNTRY_CODES,
  defaultCountryCode,
  formatPhoneWithCountryCode,
} from './countryCodes.js';

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

