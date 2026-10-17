import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getLocaleCard,
  parseDemoLocale,
} from "../../src/features/studio/modules/locale-inspector/domain";
import { localeCards } from "../../src/features/studio/modules/locale-inspector/fixtures";

test("locale selection accepts only exact local language tags", () => {
  for (const locale of ["en", "ru", "kk"] as const)
    assert.equal(parseDemoLocale(locale), locale);
  for (const invalid of [
    undefined,
    null,
    "kz",
    "RU",
    "en-US",
    "",
    ["ru"],
    {},
    "<script>",
  ])
    assert.equal(parseDemoLocale(invalid), "en");
});
test("typed cards share keys and missing keys fall back individually without mutation", () => {
  const before = structuredClone(localeCards);
  for (const locale of ["en", "ru", "kk"] as const) {
    for (const value of Object.values(localeCards[locale]))
      assert.ok(value.length > 8);
    assert.deepEqual(Object.keys(localeCards[locale]), [
      "title",
      "description",
      "action",
    ]);
    assert.deepEqual(getLocaleCard(locale).fallbackKeys, []);
    for (const missing of ["title", "description", "action"] as const) {
      const result = getLocaleCard(locale, missing);
      assert.deepEqual(result.fallbackKeys, [missing]);
      for (const key of ["title", "description", "action"] as const)
        assert.equal(
          result.card[key],
          key === missing ? localeCards.en[key] : localeCards[locale][key],
        );
    }
  }
  assert.deepEqual(localeCards, before);
});
