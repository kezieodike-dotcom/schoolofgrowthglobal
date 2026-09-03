import React, { useMemo, useState } from 'react';
import {
  COUNTRY_CODES,
  defaultCountryCode,
  formatPhoneWithCountryCode,
} from '../lib/countryCodes';

interface CountryPhoneFieldProps {
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  className?: string;
  invalid?: boolean;
  describedBy?: string;
  autoComplete?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const flagClass: Record<string, string> = {
  NG: 'from-emerald-700 via-white to-emerald-700',
  GB: 'from-blue-800 via-white to-red-700',
  US: 'from-blue-800 via-white to-red-700',
  GH: 'from-red-600 via-yellow-400 to-emerald-700',
  CA: 'from-red-600 via-white to-red-600',
  ZA: 'from-emerald-700 via-yellow-400 to-blue-800',
  KE: 'from-black via-red-700 to-emerald-700',
  AE: 'from-red-600 via-white to-emerald-700',
};

export const CountryPhoneField: React.FC<CountryPhoneFieldProps> = ({
  id,
  name = 'phone',
  value,
  required,
  className = '',
  invalid,
  describedBy,
  autoComplete = 'tel',
  placeholder = '801 234 5678',
  onChange,
}) => {
  const initialCountry =
    COUNTRY_CODES.find((country) => value?.trim().startsWith(country.dialCode)) ??
    defaultCountryCode;
  const [countryIso, setCountryIso] = useState(initialCountry.iso);
  const selected = useMemo(
    () => COUNTRY_CODES.find((country) => country.iso === countryIso) ?? defaultCountryCode,
    [countryIso]
  );
  const [localPhone, setLocalPhone] = useState(() =>
    value?.trim().startsWith(initialCountry.dialCode)
      ? value.trim().slice(initialCountry.dialCode.length).trim()
      : value ?? ''
  );
  const fullPhone = formatPhoneWithCountryCode(selected.dialCode, localPhone);

  const updateCountry = (nextIso: string) => {
    setCountryIso(nextIso);
    const country = COUNTRY_CODES.find((item) => item.iso === nextIso) ?? defaultCountryCode;
    onChange?.(formatPhoneWithCountryCode(country.dialCode, localPhone));
  };

  const updatePhone = (nextPhone: string) => {
    setLocalPhone(nextPhone);
    onChange?.(formatPhoneWithCountryCode(selected.dialCode, nextPhone));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[132px_1fr] gap-2">
        <div className="relative">
          <span className="sr-only">Country code</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-2.5 top-1/2 h-5 w-8 -translate-y-1/2 rounded bg-gradient-to-r ${flagClass[selected.iso] ?? 'from-slate-300 to-slate-100'} border border-slate-200 text-[8px] font-black text-slate-950 flex items-center justify-center`}
          >
            {selected.flag}
          </span>
          <select
            value={countryIso}
            onChange={(event) => updateCountry(event.target.value)}
            className={`${className} pl-12 pr-2`}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.iso} value={country.iso}>
                {country.dialCode} {country.name}
              </option>
            ))}
          </select>
        </div>
        <input
          id={id}
          type="tel"
          value={localPhone}
          onChange={(event) => updatePhone(event.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={className}
        />
      </div>
      <input type="hidden" name={name} value={value ?? fullPhone} />
    </div>
  );
};
