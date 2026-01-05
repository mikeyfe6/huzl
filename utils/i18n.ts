import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import nl from "@/locales/nl.json";

const resources = {
    en: { translation: en },
    nl: { translation: nl },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";
const fallbackLanguage = deviceLanguage.startsWith("nl") ? "nl" : "en";

i18n.use(initReactI18next).init({
    resources,
    lng: fallbackLanguage,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export { default } from "i18next";
