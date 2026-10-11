import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { Language } from '../types';
import { getStoredValue, setStoredValue } from '../utils/storage';
import { getUiTranslation } from './uiTranslations';

interface PerformanceModeContextValue {
  highGraphics: boolean;
  toggleHighGraphics: () => void;
  setHighGraphics: (value: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const PerformanceModeContext = createContext<PerformanceModeContextValue | undefined>(undefined);

// Typed Translation Dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    navHome: "Home",
    navFeatures: "Features",
    navCourses: "Courses",
    navDashboard: "Dashboard",
    navLogin: "Log In",
    navSignup: "Get Started",
    navLogout: "Log Out",
    highGraphics: "High Graphics",
    normalMode: "Normal Mode",
    welcome: "Welcome back",
    heroTitle: "Smarter Learning, Powered by AI",
    heroSub: "Built for Every Student.",
    heroDesc: "Master subjects faster with personalized AI tutoring, gamified progress tracking, and interactive markdown lessons designed for your success.",
    exploreCourses: "Explore Courses",
    getStarted: "Get Started Free",
    featuresTitle: "Supercharge Your Learning Journey",
    featuresSub: "Cutting-edge tools crafted for maximum student retention and engagement.",
    howItWorksTitle: "3 Easy Steps to Academic Mastery",
    statsStudents: "Active Students",
    statsCourses: "Interactive Courses",
    statsLanguages: "Languages Supported",
    statsSuccess: "Student Success Rate",
    featuredLessonTitle: "Featured AI Lesson Preview",
    featuredLessonSub: "Experience our rich Markdown lesson notes pipeline powered by real-time AI formatting.",
    footerTagline: "Smarter Learning for a Brighter Future.",
    footerQuickLinks: "Quick Links",
    footerRights: "© 2026 IntellEdu. All rights reserved."
  },
  gu: {
    navHome: "હોમ",
    navFeatures: "વિશેષતાઓ",
    navCourses: "કોર્સ",
    navDashboard: "ડેશબોર્ડ",
    navLogin: "લોગ ઇન",
    navSignup: "શરૂ કરો",
    navLogout: "લોગ આઉટ",
    highGraphics: "હાઇ ગ્રાફિક્સ",
    normalMode: "સામાન્ય મોડ",
    welcome: "પાછા સ્વાગત છે",
    heroTitle: "એઆઈ સાથે સ્માર્ટ શિક્ષણ",
    heroSub: "દરેક વિદ્યાર્થી માટે બનાવેલ.",
    heroDesc: "તમારી સફળતા માટે ડિઝાઇન કરાયેલ વ્યક્તિગત AI ટ્યુટરિંગ અને ઇન્ટરેક્ટિવ પાઠ સાથે તમામ વિષયોમાં માસ્ટરી મેળવો.",
    exploreCourses: "કોર્સ શોધો",
    getStarted: "મફત શરૂ કરો",
    featuresTitle: "તમારી શીખવાની યાત્રાને ઝડપી બનાવો",
    featuresSub: "મહત્તમ વિદ્યાર્થી જોડાણ માટે એડવાન્સ સાધનો.",
    howItWorksTitle: "સફળતાના 3 સરળ તબક્કા",
    statsStudents: "સક્રિય વિદ્યાર્થીઓ",
    statsCourses: "ઇન્ટરેક્ટિવ કોર્સ",
    statsLanguages: "સપોર્ટેડ ભાષાઓ",
    statsSuccess: "સફળતા દર",
    featuredLessonTitle: "ફીચર્ડ પાઠ પૂર્વાવલોકન",
    featuredLessonSub: "Markdown પાઠ અને રીઅલ-ટાઇમ AI નોટ્સનો અનુભવ કરો.",
    footerTagline: "ઉજ્જવળ ભવિષ્ય માટે સ્માર્ટ લર્નિંગ.",
    footerQuickLinks: "ઝડપી લિંક્સ",
    footerRights: "© ૨૦૨૬ IntellEdu. સર્વાધિકાર સુરક્ષિત."
  },
  hi: {
    navHome: "होम",
    navFeatures: "विशेषताएं",
    navCourses: "पाठ्यक्रम",
    navDashboard: "डैशबोर्ड",
    navLogin: "लॉग इन",
    navSignup: "शुरू करें",
    navLogout: "लॉग आउट",
    highGraphics: "हाई ग्राफिक्स",
    normalMode: "सामान्य मोड",
    welcome: "वापसी पर स्वागत है",
    heroTitle: "AI संचालित स्मार्ट शिक्षा",
    heroSub: "हर छात्र के लिए निर्मित।",
    heroDesc: "व्यक्तिगत AI ट्यूटरिंग, गेमफाइड प्रोग्रेस ट्रैकिंग और इंटरैक्टिव पाठों के साथ अपनी पढ़ाई को आसान बनाएं।",
    exploreCourses: "कोर्स देखें",
    getStarted: "निःशुल्क शुरू करें",
    featuresTitle: "अपनी सीखने की क्षमता को बढ़ाएं",
    featuresSub: "छात्रों की बेहतर समझ के लिए आधुनिक एआई टूल्स।",
    howItWorksTitle: "सफलता के 3 आसान चरण",
    statsStudents: "सक्रिय छात्र",
    statsCourses: "इंटरैक्टिव कोर्स",
    statsLanguages: "समर्थित भाषाएँ",
    statsSuccess: "सफलता दर",
    featuredLessonTitle: "विशेष पाठ पूर्वावलोकन",
    featuredLessonSub: "Markdown पाठ और AI नोट्स पाइपलाइन का अनुभव करें।",
    footerTagline: "उज्ज्वल भविष्य के लिए स्मार्ट लर्निंग।",
    footerQuickLinks: "क्विक लिंक्स",
    footerRights: "© 2026 IntellEdu. सर्वाधिकार सुरक्षित।"
  }
};

const translateUiText = (language: Language, text: string): string | undefined =>
  getUiTranslation(language, text) ?? translations[language]?.[text];

/**
 * Custom hook to detect mobile viewport (<768px)
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

interface ProviderProps {
  children: ReactNode;
}

export const PerformanceModeProvider: React.FC<ProviderProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const originalText = useRef(new WeakMap<Text, string>());
  const translatedText = useRef(new WeakMap<Text, string>());
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>());
  const translatedAttributes = useRef(new WeakMap<Element, Map<string, string>>());

  const [highGraphics, setHighGraphicsState] = useState<boolean>(() => {
    return getStoredValue<boolean>('intellEdu_highGraphics', !isMobile);
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return getStoredValue<Language>('intellEdu_language', 'en');
  });

  useEffect(() => {
    const excludedSelector = 'script, style, code, pre, input, textarea, [contenteditable="true"], [data-no-translate], .markdown-viewer, .prose';
    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    const translateTextNode = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || parent.closest(excludedSelector)) return;

      const value = node.nodeValue ?? '';
      const previousTranslation = translatedText.current.get(node);
      let source = originalText.current.get(node);
      if (source === undefined || value !== previousTranslation) {
        source = value;
        originalText.current.set(node, source);
      }

      const trimmed = source.trim().replace(/\s+/g, ' ');
      const translation = language === 'en' ? undefined : translateUiText(language, trimmed);
      const leading = source.match(/^\s*/)?.[0] ?? '';
      const trailing = source.match(/\s*$/)?.[0] ?? '';
      const nextValue = translation ? `${leading}${translation}${trailing}` : source;

      if (node.nodeValue !== nextValue) {
        translatedText.current.set(node, nextValue);
        node.nodeValue = nextValue;
      } else {
        translatedText.current.set(node, nextValue);
      }
    };

    const translateAttributes = (element: Element) => {
      if (element.closest(excludedSelector)) return;
      const values = originalAttributes.current.get(element) ?? new Map<string, string>();
      const outputs = translatedAttributes.current.get(element) ?? new Map<string, string>();

      for (const attribute of ['placeholder', 'aria-label', 'title']) {
        const current = element.getAttribute(attribute);
        if (current === null) continue;
        const previousTranslation = outputs.get(attribute);
        let source = values.get(attribute);
        if (source === undefined || current !== previousTranslation) {
          source = current;
          values.set(attribute, source);
        }
        const translation = language === 'en' ? undefined : translateUiText(language, source.trim().replace(/\s+/g, ' '));
        const nextValue = translation ?? source;
        if (current !== nextValue) element.setAttribute(attribute, nextValue);
        outputs.set(attribute, nextValue);
      }

      originalAttributes.current.set(element, values);
      translatedAttributes.current.set(element, outputs);
    };

    const translateSubtree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root as Text);
        return;
      }

      if (root instanceof Element) translateAttributes(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) translateTextNode(walker.currentNode as Text);
      if (root instanceof Element) {
        root.querySelectorAll('*').forEach(translateAttributes);
      }
    };

    while (textWalker.nextNode()) translateTextNode(textWalker.currentNode as Text);
    document.body.querySelectorAll('*').forEach(translateAttributes);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData' && record.target instanceof Text) {
          translateTextNode(record.target);
        } else if (record.type === 'attributes' && record.target instanceof Element) {
          translateAttributes(record.target);
        } else {
          record.addedNodes.forEach(translateSubtree);
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title'],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const toggleHighGraphics = () => {
    setHighGraphicsState(prev => {
      const next = !prev;
      setStoredValue('intellEdu_highGraphics', next);
      return next;
    });
  };

  const setHighGraphics = (value: boolean) => {
    setHighGraphicsState(value);
    setStoredValue('intellEdu_highGraphics', value);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredValue('intellEdu_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <PerformanceModeContext.Provider
      value={{
        highGraphics,
        toggleHighGraphics,
        setHighGraphics,
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </PerformanceModeContext.Provider>
  );
};

export const usePerformanceMode = (): PerformanceModeContextValue => {
  const context = useContext(PerformanceModeContext);
  if (!context) {
    throw new Error('usePerformanceMode must be used within a PerformanceModeProvider');
  }
  return context;
};
