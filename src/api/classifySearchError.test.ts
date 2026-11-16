import { describe, it, expect } from "vitest";
import { classifySearchError } from "./classifySearchError.js";
import { HttpError } from "./countriesApi.js";

describe("classifySearchError", () => {
  it("recognizes user AbortError as non-error cancellation", () => {
    const abortError = new DOMException("Aborted by user", "AbortError");
    expect(classifySearchError(abortError)).toEqual({ type: "Aborted" });
  });

  it("recognizes TimeoutError separately from AbortError", () => {
    const timeoutError = new DOMException("Request timed out", "TimeoutError");
    const result = classifySearchError(timeoutError);

    expect(result.type).toBe("timeout");
  });

  it("recognizes HttpError with status code", () => {
    const httpError = new HttpError(500, "Server Error");
    const result = classifySearchError(httpError);

    expect(result).toEqual({
      type: "http",
      status: 500,
      message: "Server Error",
    });
  });

  it("classifies unknown or network error as network failure", () => {
    const networkError = new TypeError("Failed to fetch");
    const result = classifySearchError(networkError);

    expect(result.type).toBe("network");
  });
});
