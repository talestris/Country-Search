export interface RawCountryLanguage {
  iso639_1?: string;
  iso639_2?: string;
  name: string;
  nativeName?: string;
}

export interface RawCountryCurrency {
  code: string;
  name: string;
  symbol?: string;
}

export interface RawCountry {
  name: string;
  nativeName?: string;
  alpha3Code?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  flag?: string;
  flags?: {
    svg?: string;
    png?: string;
  };
  languages?: RawCountryLanguage[];
  currencies?: RawCountryCurrency[];
}

export interface Country {
  name: string;
  nativeName: string;
  flagUrl: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
}

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; query: string; countries: Country[] }
  | { status: "empty"; query: string }
  | { status: "error"; query: string; message: string };
