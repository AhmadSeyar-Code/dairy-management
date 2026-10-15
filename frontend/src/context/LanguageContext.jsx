import { useEffect, useState } from "react";
import { LanguageContext } from "./context";

const supportedLanguages = ["en", "fa"];

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => {
      const savedLanguage = localStorage.getItem("language");
      return supportedLanguages.includes(savedLanguage) ? savedLanguage : "en";
    },
  );

  useEffect(() => {
    localStorage.setItem("language", language);

    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";

    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === "en" ? "fa" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageProvider };
