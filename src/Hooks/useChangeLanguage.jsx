import { useEffect, useState } from 'react';
import {
  AboutData, HeaderData, HomeData, SkillsData
} from '../Data/Export.data';

const useChangeLanguage = () => {
  const [language, setLanguage] = useState('ptBR');
  const [data, setData] = useState({
    home: HomeData[language],
    about: AboutData[language],
    skills: SkillsData[language],
    header: HeaderData[language]
  });

  useEffect(() => {
    const languageStorage = localStorage.getItem('language');
    if (languageStorage) {
      setLanguage(languageStorage);
    } else {
      /* Caso não haja sete a informação */
      localStorage.setItem('language', 'ptBR');
    }

    const languageSectionStorage = sessionStorage.getItem('language');
    if (languageSectionStorage) {
      setLanguage(languageSectionStorage);
    } else {
      /* Caso não haja sete a informação */
      sessionStorage.setItem('language', 'ptBR');
    }
  }, [language]);

  const handleChangeLanguage = (language) => {
    setLanguage(language);
    localStorage.setItem('language', language);
    sessionStorage.setItem('language', language);
  };

  useEffect(() => {
    setData({
      home: HomeData[language],
      about: AboutData[language],
      skills: SkillsData[language],
      header: HeaderData[language]
    });
  }, [language])

  return {
    language,
    handleChangeLanguage,
    data
  }
};

export default useChangeLanguage
