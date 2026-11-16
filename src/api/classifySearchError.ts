import { HttpError } from "./countriesApi.js";

export type SearchErrorResult =
  | { type: "Aborted" }
  | { type: "timeout"; message: string }
  | { type: "http"; status: number; message: string }
  | { type: "network"; message: string };

export function classifySearchError(error: unknown): SearchErrorResult {
  if (error instanceof HttpError) {
    return {
      type: "http",
      status: error.status,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return { type: "Aborted" };
    }

    if (error.name === "TimeoutError") {
      return {
        type: "timeout",
        message: "Request timed out. The server took too long to respond",
      };
    }
  }

  return {
    type: "network",
    message: "Network error. Please check your internet connection and try again",
  };
}
