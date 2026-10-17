import type { DemoLocale, LocaleCard } from "./domain";
export const localeCards: Readonly<Record<DemoLocale, Readonly<LocaleCard>>> =
  Object.freeze({
    en: Object.freeze({
      title: "Make a boundary visible",
      description:
        "A clear contract helps people understand what enters a system, what changes, and how to recover.",
      action: "Inspect the example",
    }),
    ru: Object.freeze({
      title: "Сделать границу понятной",
      description:
        "Ясный контракт помогает понять, что поступает в систему, что меняется и как восстановиться после ошибки.",
      action: "Изучить пример",
    }),
    kk: Object.freeze({
      title: "Шекараны түсінікті ету",
      description:
        "Нақты келісім жүйеге не кіретінін, не өзгеретінін және қателіктен кейін қалай қалпына келуге болатынын түсіндіреді.",
      action: "Мысалды қарау",
    }),
  });
