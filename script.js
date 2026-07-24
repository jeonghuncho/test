import { buildAnalysis } from "./analysis.js";
import { fetchBookResearch } from "./api.js";
import { searchSuggestions } from "./catalog.js";
import {
  currentQuery,
  hideSuggestions,
  renderError,
  renderInitial,
  renderResult,
  renderSuggestions,
  setLanguage,
  setLoading,
  setQuery,
  suggestionTarget,
  translatedMessage,
} from "./ui.js";

const form = document.querySelector("#search-form");
const sampleButton = document.querySelector("#sample-button");
const queryInput = document.querySelector("#book-query");
const languageSelect = document.querySelector("#language-select");
const suggestionsList = document.querySelector("#suggestions-list");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  void search(currentQuery());
});

sampleButton.addEventListener("click", () => {
  setQuery("Harry Potter");
  hideSuggestions();
  void search("Harry Potter");
});

queryInput.addEventListener("input", () => {
  renderSuggestions(searchSuggestions(currentQuery()));
});

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSuggestions();
  }
});

languageSelect.addEventListener("change", () => {
  setLanguage(languageSelect.value);
});

suggestionsList.addEventListener("click", (event) => {
  const suggestion = suggestionTarget(event);
  if (!suggestion) {
    return;
  }
  setQuery(suggestion);
  hideSuggestions();
  void search(suggestion);
});

renderInitial();
setLanguage(languageSelect.value);

async function search(query) {
  if (!query) {
    renderError("빈 검색어", translatedMessage("emptyQuery"));
    return;
  }
  hideSuggestions();
  setLoading(true);
  try {
    const research = await fetchBookResearch(query);
    renderResult(buildAnalysis(research));
  } catch (error) {
    renderError(query, error instanceof Error && error.message === "book_not_found"
      ? translatedMessage("notFound")
      : translatedMessage("requestFailed"));
  } finally {
    setLoading(false);
  }
}
