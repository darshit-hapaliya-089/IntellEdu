import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { Language } from '../types';

interface LangOption {
  code: Language;
  shortLabel: string;
  label: string;
  flag: string;
}

const languages: LangOption[] = [
  { code: 'en', shortLabel: 'EN', label: 'English', flag: '' },
  { code: 'gu', shortLabel: 'GU', label: 'ગુજરાતી', flag: '' },
  { code: 'hi', shortLabel: 'HI', label: 'हिंदी', flag: '' },
];

export interface LanguageSelectorProps {
  compactOnMobile?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compactOnMobile = true }) => {
  const { language, setLanguage, highGraphics } = usePerformanceMode();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Select Interface Language"
        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none active:scale-95 ${
          highGraphics
            ? 'bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-sm'
            : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="text-xs">
          {currentLang.flag}{' '}
          <span className={compactOnMobile ? 'hidden sm:inline' : 'inline'}>{currentLang.label}</span>
          <span className={compactOnMobile ? 'inline sm:hidden font-bold' : 'hidden'}>{currentLang.shortLabel}</span>
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-1.5 w-36 max-w-[85vw] rounded-xl shadow-xl bg-white ring-1 ring-black/5 divide-y divide-slate-100 z-50 overflow-hidden ${
            highGraphics ? 'animate-in fade-in slide-in-from-top-2 duration-200' : ''
          }`}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer active:bg-indigo-100 ${
                  language === lang.code
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{lang.flag} {lang.label}</span>
                {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
