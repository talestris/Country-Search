import { describe, it, expect } from "vitest";
import { mapCountryResponse } from "./mapCountryResponse.js";
import type { RawCountry } from "./types.js";

describe("mapCountryResponse", () => {
  it("maps a complete raw country object to Country model", () => {
    const rawSpain: RawCountry = {
      name: "Spain",
      nativeName: "España",
      capital: "Madrid",
      region: "Europe",
      subregion: "Southern Europe",
      population: 47351567,
      area: 505992,
      borders: ["AND", "FRA", "GIB", "PRT", "MAR"],
      flags: {
        png: "https://flagcdn.com/w320/es.png",
        svg: "https://flagcdn.com/es.svg",
      },
      languages: [{ iso639_1: "es", name: "Spanish", nativeName: "Español" }],
      currencies: [{ code: "EUR", name: "Euro", symbol: "€" }],
    };

    const result = mapCountryResponse(rawSpain);

    expect(result).toEqual({
      name: "Spain",
      nativeName: "España",
      flagUrl: "https://flagcdn.com/es.svg",
      capital: "Madrid",
      region: "Europe",
      subregion: "Southern Europe",
      population: 47351567,
      area: 505992,
      borders: ["AND", "FRA", "GIB", "PRT", "MAR"],
      languages: ["Spanish"],
      currencies: ["Euro (€)"],
    });
  });

  it("handles missing optional fields gracefully", () => {
    const rawAntarctica: RawCountry = {
      name: "Antarctica",
      region: "Polar",
      population: 1000,
    };

    const result = mapCountryResponse(rawAntarctica);

    expect(result).toEqual({
      name: "Antarctica",
      nativeName: "Antarctica",
      flagUrl: "",
      capital: "N/A",
      region: "Polar",
      subregion: "Polar",
      population: 1000,
      area: null,
      borders: [],
      languages: [],
      currencies: [],
    });
  });

  it("falls back to png flag when svg is missing", () => {
    const rawSpain: RawCountry = {
      name: "Spain",
      flags: {
        png: "https://flagcdn.com/w320/es.png",
      },
    };

    const result = mapCountryResponse(rawSpain);

    expect(result.flagUrl).toBe("https://flagcdn.com/w320/es.png");
  });
});
