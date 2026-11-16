import { classifySearchError } from "../api/classifySearchError.js";
import { searchCountries } from "../api/countriesApi.js";
import type { SearchState } from "../models/types.js";
import { debounce, DebouncedFunction } from "../utils/debounce.js";

const DEFAULT_TIMEOUT_MS = 8000;

export class SearchController {
  private currentAbortController: AbortController | null = null;
  private lastQuery = "";
  private readonly debouncedSearch: DebouncedFunction<(query: string) => void>;

  private async executeSearch(query: string): Promise<void> {
    if (this.lastQuery !== query) return;

    const abortController = new AbortController();
    this.currentAbortController = abortController;

    this.onStateChange({ status: "loading", query });

    try {
      const combinedSignal = AbortSignal.any([
        abortController.signal,
        AbortSignal.timeout(this.timeoutMs),
      ]);

      const countries = await searchCountries(query, combinedSignal);

      if (this.lastQuery !== query) return;

      if (countries.length === 0) {
        this.onStateChange({ status: "empty", query });
      } else {
        this.onStateChange({ status: "success", query, countries });
      }
    } catch (error: unknown) {
      const classified = classifySearchError(error);

      if (classified.type === "Aborted") return;

      this.onStateChange({ status: "error", query, message: classified.message });
    }
  }

  constructor(
    private readonly onStateChange: (state: SearchState) => void,
    delay = 300,
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS
  ) {
    this.debouncedSearch = debounce((query: string) => {
      void this.executeSearch(query);
    }, delay);
  }

  public handleInput(rawQuery: string): void {
    this.currentAbortController?.abort();
    this.currentAbortController = null;

    const query = rawQuery.trim();
    this.lastQuery = query;

    if (!query) {
      this.debouncedSearch.cancel();
      this.onStateChange({ status: "idle" });
      return;
    }

    this.debouncedSearch(query);
  }

  public retry(): void {
    if (!this.lastQuery) return;

    this.debouncedSearch.cancel();
    this.currentAbortController?.abort();
    void this.executeSearch(this.lastQuery);
  }
}
