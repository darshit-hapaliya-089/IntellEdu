import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { defaultCountries, usePhoneInput, type CountryIso2 } from 'react-international-phone';

const countryOptions = defaultCountries.map((country) => ({
  name: country[0],
  iso2: country[1],
  dialCode: country[2],
}));

function flagEmoji(iso2: string): string {
  return String.fromCodePoint(...iso2.toUpperCase().split('').map((character) => character.charCodeAt(0) + 127397));
}

interface PhoneNumberFieldProps {
  value: string;
  onChange: (phone: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}

export const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  value,
  onChange,
  invalid = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry: 'in',
    value,
    disableDialCodeAndPrefix: true,
    onChange: ({ phone: e164 }) => onChange(e164),
  });

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countryOptions;
    return countryOptions.filter(({ name, iso2, dialCode }) =>
      name.toLowerCase().includes(query) ||
      iso2.toLowerCase().includes(query) ||
      `+${dialCode}`.includes(query)
    );
  }, [search]);

  const selectCountry = (iso2: CountryIso2) => {
    setCountry(iso2);
    onChange('');
    setSearch('');
    setOpen(false);
  };

  return (
    <div className={`relative flex h-10 w-full items-stretch rounded-xl border bg-slate-50/50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 ${
      invalid ? 'border-2 border-rose-500 bg-rose-50/30' : 'border-slate-300'
    }`}>
      <button
        type="button"
        aria-label={`Country code ${country.name} +${country.dialCode}`}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-l-xl px-2.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed"
      >
        <span aria-hidden="true">{flagEmoji(country.iso2)}</span>
        <span className="text-xs font-semibold">+{country.dialCode}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      <input
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={inputValue}
        disabled={disabled}
        onChange={handlePhoneValueChange}
        aria-invalid={invalid}
        placeholder="Local phone number"
        className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-2 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-sm"
      />

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <label className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search country or dial code"
              aria-label="Search countries"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
            />
          </label>
          <ul className="max-h-56 overflow-y-auto py-1" role="listbox" aria-label="Countries">
            {filteredCountries.map((option) => (
              <li key={option.iso2}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.iso2 === country.iso2}
                  onClick={() => selectCountry(option.iso2)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50"
                >
                  <span aria-hidden="true">{flagEmoji(option.iso2)}</span>
                  <span className="min-w-0 flex-1 truncate">{option.name}</span>
                  <span className="text-slate-500">+{option.dialCode}</span>
                </button>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-3 text-sm text-slate-500">No countries found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberField;
