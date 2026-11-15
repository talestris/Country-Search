import type { Country, RawCountry } from "./types.js";

export function mapCountryResponse(raw: RawCountry): Country {
  const region = raw.region ?? "Unknown";

  return {
    name: raw.name,
    nativeName: raw.nativeName ?? raw.name,
    flagUrl: raw.flags?.svg ?? raw.flags?.png ?? raw.flag ?? "",
    capital: raw.capital ?? "N/A",
    region,
    subregion: raw.subregion ?? region,
    population: raw.population ?? 0,
    area: raw.area ?? null,
    borders: raw.borders ? [...raw.borders] : [],
    languages: raw.languages ? raw.languages.map((lang) => lang.name) : [],
    currencies: raw.currencies
      ? raw.currencies.map((curr) => (curr.symbol ? `${curr.name} (${curr.symbol})` : curr.name))
      : [],
  };
}
