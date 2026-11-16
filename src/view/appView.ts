import type { Country, SearchState } from "../models/types.js";

export interface AppViewCallbacks {
  onInput: (query: string) => void;
  onRetry: () => void;
}

export class AppView {
  private readonly root: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly statusContainer: HTMLElement;

  private readonly modalDialog: HTMLDialogElement;
  private readonly modalBody: HTMLElement;

  private createEl<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);

    if (className) {
      el.className = className;
    }

    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  private createDetailLine(label: string, value: string): HTMLElement {
    const p = this.createEl("p", "detail-line");
    const strong = this.createEl("strong", "detail-label", `${label}: `);
    const span = this.createEl("span", "detail-value", value);
    p.append(strong, span);
    return p;
  }

  private openModal(country: Country): void {
    this.modalBody.replaceChildren();

    if (country.flagUrl) {
      const img = document.createElement("img");
      img.className = "modal-flag";
      img.src = country.flagUrl;
      img.alt = `Flag of ${country.name}`;
      this.modalBody.append(img);
    }

    const title = this.createEl("h2", "modal-title", country.name);
    const nativeName = this.createDetailLine("Native name", country.nativeName);
    const capital = this.createDetailLine("Capital", country.capital);
    const region = this.createDetailLine("Region", `${country.region} (${country.subregion})`);
    const population = this.createDetailLine(
      "Population",
      country.population.toLocaleString("en-US")
    );
    const area = this.createDetailLine(
      "Area",
      country.area !== null ? `${country.area.toLocaleString("en-US")} km²` : "N/A"
    );
    const languages = this.createDetailLine(
      "Languages",
      country.languages.length > 0 ? country.languages.join(", ") : "N/A"
    );
    const currencies = this.createDetailLine(
      "Currencies",
      country.currencies.length > 0 ? country.currencies.join(", ") : "N/A"
    );
    const borders = this.createDetailLine(
      "Borders",
      country.borders.length > 0 ? country.borders.join(", ") : "None"
    );

    this.modalBody.append(
      title,
      nativeName,
      capital,
      region,
      population,
      area,
      languages,
      currencies,
      borders
    );

    this.modalDialog.showModal();
  }

  private closeModal(): void {
    this.modalDialog.close();
  }

  constructor(private readonly callbacks: AppViewCallbacks) {
    this.root = this.createEl("main", "app");

    const header = this.createEl("header", "app-header");
    const title = this.createEl("h1", "app-title", "Country Search");
    const subtitle = this.createEl(
      "p",
      "app-subtitle",
      "Start typing a country name to search in real time"
    );

    const searchBox = this.createEl("div", "search-box");
    this.input = document.createElement("input");
    this.input.type = "search";
    this.input.className = "search-input";
    this.input.placeholder = "For example: Spain, Japan, Brazil";
    this.input.setAttribute("aria-label", "Search country by name");
    this.input.addEventListener("input", () => {
      this.callbacks.onInput(this.input.value);
    });

    searchBox.append(this.input);
    header.append(title, subtitle, searchBox);

    this.statusContainer = this.createEl("section", "results-container");
    this.statusContainer.setAttribute("aria-live", "polite");

    this.modalDialog = this.createEl("dialog", "modal-dialog");

    const modalContent = this.createEl("div", "modal-content");
    const closeButton = this.createEl("button", "modal-close", "✕");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close details");
    closeButton.addEventListener("click", () => this.closeModal());

    this.modalBody = this.createEl("div", "modal-body");
    modalContent.append(closeButton, this.modalBody);
    this.modalDialog.append(modalContent);

    this.modalDialog.addEventListener("click", (event) => {
      if (event.target === this.modalDialog) {
        this.closeModal();
      }
    });

    this.root.append(header, this.statusContainer);
    document.body.append(this.root, this.modalDialog);
  }

  private createCountryCard(country: Country): HTMLElement {
    const card = this.createEl("article", "country-card");
    card.tabIndex = 0;

    if (country.flagUrl) {
      const img = document.createElement("img");
      img.className = "country-flag";
      img.src = country.flagUrl;
      img.alt = `Flag of ${country.name}`;
      img.loading = "lazy";
      card.append(img);
    }

    const body = this.createEl("div", "card-body");
    const name = this.createEl("h2", "card-title", country.name);
    const capital = this.createDetailLine("Capital", country.capital);
    const region = this.createDetailLine("Region", country.region);
    const population = this.createDetailLine(
      "Population",
      country.population.toLocaleString("en-US")
    );

    body.append(name, capital, region, population);
    card.append(body);

    const handleOpen = (): void => this.openModal(country);
    card.addEventListener("click", handleOpen);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleOpen();
      }
    });

    return card;
  }

  public render(state: SearchState): void {
    this.statusContainer.replaceChildren();

    switch (state.status) {
      case "idle": {
        const message = this.createEl(
          "p",
          "state-message state-idle",
          "Enter a country name above to begin searching"
        );
        this.statusContainer.append(message);
        break;
      }

      case "loading": {
        const wrapper = this.createEl("div", "state-loading");
        const spinner = this.createEl("div", "spinner");
        const text = this.createEl("p", "state-message", `Searching for "${state.query}"...`);
        wrapper.append(spinner, text);
        this.statusContainer.append(wrapper);
        break;
      }

      case "empty": {
        const box = this.createEl("div", "state-empty");
        const heading = this.createEl(
          "p",
          "empty-title",
          `No countries found for "${state.query}"`
        );
        const hint = this.createEl(
          "p",
          "empty-hint",
          "Check the spelling or try another country name."
        );
        box.append(heading, hint);
        this.statusContainer.append(box);
        break;
      }

      case "error": {
        const box = this.createEl("div", "state-error");
        const text = this.createEl("p", "error-message", state.message);
        const retryBtn = this.createEl("button", "retry-button", "Retry");
        retryBtn.type = "button";
        retryBtn.addEventListener("click", () => {
          this.callbacks.onRetry();
        });
        box.append(text, retryBtn);
        this.statusContainer.append(box);
        break;
      }

      case "success": {
        const grid = this.createEl("div", "countries-grid");
        for (const country of state.countries) {
          grid.append(this.createCountryCard(country));
        }
        this.statusContainer.append(grid);
        break;
      }
    }
  }
}
