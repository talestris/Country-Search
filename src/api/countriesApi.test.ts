import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchCountries, HttpError } from "./countriesApi.js";
import type { RawCountry } from "../models/types.js";

describe("searchCountries", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("returns mapped countries when response is 200 OK", async () => {
    const rawResponse: RawCountry[] = [
      {
        name: "Spain",
        nativeName: "España",
        capital: "Madrid",
        region: "Europe",
        population: 47351567,
        flags: { svg: "https://flagcdn.com/es.svg" },
      },
    ];

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => rawResponse,
    });

    const controller = new AbortController();
    const result = await searchCountries("Spain", controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("https://countries.dev/name/Spain", {
      signal: controller.signal,
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Spain");
    expect(result[0].capital).toBe("Madrid");
  });

  it("returns an empty array when response status is 404", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(searchCountries("Spain")).rejects.toThrow(HttpError);
    await expect(searchCountries("Spain")).rejects.toMatchObject({
      status: 500,
    });
  });

  it("propagates network or AbortError rejections from fetch", async () => {
    const abortError = new DOMException("The operation was aborted", "AbortError");
    fetchMock.mockRejectedValue(abortError);

    await expect(searchCountries("Spain")).rejects.toThrow("The operation was aborted");
  });
});
