import { mapCountryResponse } from "../models/mapCountryResponse.js";
import type { Country, RawCountry } from "../models/types.js";

const BASE_URL = "https://countries.dev";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `HTTP Error: ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function searchCountries(query: string, signal?: AbortSignal): Promise<Country[]> {
  const url = `${BASE_URL}/name/${encodeURIComponent(query)}`;
  const response = await fetch(url, signal ? { signal } : undefined);

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Request failed with status ${response.status} ${response.statusText}`.trim()
    );
  }

  const rawCountries: RawCountry[] = await response.json();
  return rawCountries.map(mapCountryResponse);
}
