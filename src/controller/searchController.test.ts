import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SearchController } from "./searchController.js";
import type { RawCountry, SearchState } from "../models/types.js";

interface DeferredResponse {
  resolve: (value: Response) => void;
  reject: (reason?: unknown) => void;
  signal?: AbortSignal | null;
}

describe("SearchController", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("cancels outdated request on new input and resolves race condition in favor of latest query", async () => {
    const deferredRequests: DeferredResponse[] = [];

    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise<Response>((resolve, reject) => {
        const signal = init?.signal;

        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });

        deferredRequests.push({ resolve, reject, signal });
      });
    });

    const states: SearchState[] = [];
    const controller = new SearchController((state: SearchState) => {
      states.push(state);
    }, 300);

    controller.handleInput("sp");

    vi.advanceTimersByTime(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    controller.handleInput("spain");

    expect(deferredRequests[0].signal?.aborted).toBe(true);

    vi.advanceTimersByTime(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const spainData: RawCountry[] = [{ name: "Spain", capital: "Madrid" }];
    deferredRequests[1].resolve({
      ok: true,
      status: 200,
      json: async () => spainData,
    } as Response);

    await vi.runAllTimersAsync();

    const spData: RawCountry[] = [{ name: "Singapore", capital: "Singapore" }];
    deferredRequests[0].resolve({
      ok: true,
      status: 200,
      json: async () => spData,
    } as Response);

    await vi.runAllTimersAsync();

    const lastState = states[states.length - 1];
    expect(lastState.status).toBe("success");

    if (lastState.status === "success") {
      expect(lastState.query).toBe("spain");
      expect(lastState.countries[0].name).toBe("Spain");
    }

    expect(states.some((s) => s.status === "error")).toBe(false);
  });

  it("clears results and does not send request on empty input", () => {
    const states: SearchState[] = [];
    const controller = new SearchController((state: SearchState) => states.push(state), 300);

    controller.handleInput("sp");
    controller.handleInput(" ");

    vi.advanceTimersByTime(300);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(states[states.length - 1]).toEqual({ status: "idle" });
  });

  it("retries the last query when retry() is called after an error", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ name: "France", capital: "Paris" }],
    } as Response);

    const states: SearchState[] = [];
    const controller = new SearchController((state: SearchState) => states.push(state), 300);

    controller.handleInput("France");
    await vi.runAllTimersAsync();

    expect(states[states.length - 1].status).toBe("error");

    controller.retry();
    await vi.runAllTimersAsync();

    const lastState = states[states.length - 1];
    expect(lastState.status).toBe("success");

    if (lastState.status === "success") {
      expect(lastState.countries[0].name).toBe("France");
    }
  });
});
