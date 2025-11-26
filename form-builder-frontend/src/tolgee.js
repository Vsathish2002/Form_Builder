import { Tolgee, DevTools } from "@tolgee/web";
import { TolgeeProvider } from "@tolgee/react";
import { FormatIcu } from "@tolgee/format-icu";

export const tolgee = Tolgee()
  .use(FormatIcu())
  .use(DevTools())
  .init({
    apiUrl: "https://app.tolgee.io",
    apiKey: "tgpak_gi2temzwl5uwumldmz2hk5tgoyzwy33bobvge4jsnnvgm3zuhfrq", // paste your key here
    fallbackLanguage: "en",
    language: "en",
    availableLanguages: ["en", "ta", "ja", "zh", "ar", "ru"],
  });
