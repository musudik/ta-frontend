import en from './en.json';
import de from './de.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';

export const translations = {
  en,
  de,
  es,
  fr,
  it
};

export const getTranslation = (lang: string) => {
  return translations[lang as keyof typeof translations] || en;
};

export default translations; 