import { localeCards } from "./fixtures";
export type DemoLocale = "en" | "ru" | "kk";
export type LocaleCard = { title: string; description: string; action: string };
export function parseDemoLocale(value: unknown): DemoLocale {
  return value === "ru" || value === "kk" ? value : "en";
}
export function getLocaleCard(
  locale: DemoLocale,
  missingKey?: keyof LocaleCard,
): { card: LocaleCard; fallbackKeys: readonly (keyof LocaleCard)[] } {
  const card = { ...localeCards[locale] };
  if (!missingKey) return { card, fallbackKeys: [] };
  card[missingKey] = localeCards.en[missingKey];
  return { card, fallbackKeys: [missingKey] };
}
