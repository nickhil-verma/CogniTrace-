import en from './en.json';
import hi from './hi.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import ta from './ta.json';
import te from './te.json';
import bn from './bn.json';
import mr from './mr.json';
import gu from './gu.json';

export type TranslationDictionary = typeof en;

export const translations: Record<string, Record<string, unknown>> = {
  'en-US': en,
  'hi-IN': hi,
  'es-ES': es,
  'fr-FR': fr,
  'de-DE': de,
  'ta-IN': ta,
  'te-IN': te,
  'bn-IN': bn,
  'mr-IN': mr,
  'gu-IN': gu,
};

export { en, hi, es, fr, de, ta, te, bn, mr, gu };
