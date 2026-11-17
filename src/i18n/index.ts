import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en.json";
import myTranslation from "./locales/mm.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    my: { translation: myTranslation },
  },
  lng: "my",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React တွင် XSS ကာကွယ်ပြီးသားဖြစ်၍ false ထားနိုင်သည်
  },
});

export default i18n;
