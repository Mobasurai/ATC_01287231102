import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
  ];

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="ml-4 flex items-center">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          disabled={i18n.resolvedLanguage === lang.code}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out 
            ${i18n.resolvedLanguage === lang.code 
              ? 'bg-sky-700 text-white cursor-default' 
              : 'text-gray-300 hover:bg-sky-700 hover:text-white'
            }
            ${lang.code === 'ar' ? 'font-arabic' : ''}
          `}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher; 