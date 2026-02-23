import { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from '../data/i18n';

const LANG_KEY = 'chemlab_lang';

const LangContext = createContext(null);

export function LangProvider({ children }) {
    const [lang, setLangState] = useState(
        () => localStorage.getItem(LANG_KEY) || 'en'
    );

    function setLang(l) {
        setLangState(l);
        localStorage.setItem(LANG_KEY, l);
    }

    function t(key) {
        return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
    }

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error('useLang must be used inside LangProvider');
    return ctx;
}