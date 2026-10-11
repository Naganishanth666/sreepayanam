import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sreepayanam-package-language';
const SUPPORTED_LANGUAGES = new Set(['en', 'ta', 'hi']);

const readSavedLanguage = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(saved) ? saved : 'en';
  } catch {
    return 'en';
  }
};

export default function usePackageLanguage() {
  const [language, setLanguage] = useState(readSavedLanguage);

  const selectLanguage = useCallback(code => {
    if (!SUPPORTED_LANGUAGES.has(code)) return;
    setLanguage(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // The current page still changes language when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const syncLanguage = event => {
      if (event.key !== STORAGE_KEY) return;
      const nextLanguage = SUPPORTED_LANGUAGES.has(event.newValue) ? event.newValue : 'en';
      setLanguage(nextLanguage);
    };
    window.addEventListener('storage', syncLanguage);
    return () => window.removeEventListener('storage', syncLanguage);
  }, []);

  return [language, selectLanguage];
}
