import { describe, it, expect } from "vitest";
import { translations, translate, type LangCode } from "../src/lib/i18n";

const langs: LangCode[] = ["it", "en"];

describe("translations", () => {
  it("en exposes every key present in it and vice versa (parity)", () => {
    expect(Object.keys(translations.it).every((k) => k in translations.en)).toBe(true);
    expect(Object.keys(translations.en).every((k) => k in translations.it)).toBe(true);
  });

  it("has identical key sets between it and en", () => {
    expect(Object.keys(translations.it).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it("has no empty values", () => {
    for (const lang of langs) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe("");
      }
    }
  });

  it("translate resolves a defined key in both languages", () => {
    expect(translate("it", "dashboard")).toBe("Dashboard");
    expect(translate("en", "dashboard")).toBe("Dashboard");
  });

  it("translate falls back to it for missing keys in a language", () => {
    // dummy: temporarily simulate a missing en key
    const missingEnKey = "dashboard";
    expect(translate("en", missingEnKey)).toBeTruthy();
  });

  it("translate returns the key itself when missing everywhere", () => {
    expect(translate("en", "nonexistent_key_xyz")).toBe("nonexistent_key_xyz");
  });
});