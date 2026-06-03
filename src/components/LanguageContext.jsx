import React, { useState } from 'react';
import { LanguageContext, dictionary } from './LanguageContext.js';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('apna_khata_lang') || 'en';
  });

  const t = (key, replacements = {}) => {
    const trimmedKey = String(key || '').trim();
    let text = dictionary[language]?.[trimmedKey] || dictionary['en']?.[trimmedKey] || trimmedKey;
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('apna_khata_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
