import { SearchController } from "./controller/searchController.js";
import { AppView } from "./view/appView.js";

const controller = new SearchController((state) => {
  view.render(state);
});

const view = new AppView({
  onInput: (query) => controller.handleInput(query),
  onRetry: () => controller.retry(),
});

view.render({ status: "idle" });
