const scoreRanges = [
  [0, 10],
  [11, 20],
  [21, 30],
  [31, 40],
  [41, 50],
  [51, 60],
  [61, 70],
  [71, 85],
  [86, 100],
];

const translations = {
  ko: {
    brand: "Book Lens",
    title: "책 속 주제를 조사하고 <span class=\"keep\">점수화합니다</span>",
    intro: "책 제목을 입력하면 기본 정보, 10가지 검토 항목의 반영 점수, 총점 구간, 조사 근거를 한 화면에서 확인할 수 있습니다.",
    languageLabel: "언어",
    searchLabel: "책 제목",
    searchPlaceholder: "예: 해리포터, 데미안, 1984",
    searchButton: "검색",
    loadingButton: "조사 중",
    sampleButton: "예시",
    loadingNotice: "공개 자료를 조사하고 있습니다.",
    emptyEyebrow: "초기 상태",
    emptyTitle: "분석할 책 제목을 검색하세요",
    emptyCopy: "Open Library에서 책과 저자 정보를 찾고, Wikipedia/Wikidata 공개 자료로 요약과 저자 정보를 보강해 10가지 항목 점수를 산정합니다.",
    basicInfo: "기본 정보",
    total: "총점",
    chartEyebrow: "10가지 항목 점수",
    chartTitle: "반영도 그래프",
    evidenceEyebrow: "자료 조사 근거",
    evidenceTitle: "점수 산정 메모",
    methodNote: "점수는 문학 비평과 작품 설정에서 해당 주제가 얼마나 반복적으로 다뤄지는지를 기준으로 한 정성 평가입니다.",
    scoreRange: (min, max) => `${min}~${max} 구간`,
    meterLabel: (label) => `${label} 반영도`,
    errorPrefix: (query) => `"${query}" 조사 실패`,
    noSuggestions: "일치하는 책 없음",
    emptyQuery: "책 제목을 입력해야 합니다.",
    notFound: "Open Library에서 책을 찾지 못했습니다.",
    requestFailed: "공개 자료 요청 중 오류가 발생했습니다.",
  },
  en: {
    brand: "Book Lens",
    title: "Research book themes and <span class=\"keep\">score them</span>",
    intro: "Enter a book title to view core information, scores for 10 review categories, the total range, and research evidence in one screen.",
    languageLabel: "Language",
    searchLabel: "Book title",
    searchPlaceholder: "e.g. Harry Potter, Demian, 1984",
    searchButton: "Search",
    loadingButton: "Researching",
    sampleButton: "Example",
    loadingNotice: "Researching public sources.",
    emptyEyebrow: "Start",
    emptyTitle: "Search for a book to analyze",
    emptyCopy: "The site finds book and author data from Open Library, then supplements summaries and author details with public Wikipedia/Wikidata data.",
    basicInfo: "Basic info",
    total: "Total",
    chartEyebrow: "10 category scores",
    chartTitle: "Reflection graph",
    evidenceEyebrow: "Research evidence",
    evidenceTitle: "Scoring notes",
    methodNote: "Scores are qualitative estimates based on how repeatedly each theme appears in public literary criticism and story settings.",
    scoreRange: (min, max) => `${min}-${max} range`,
    meterLabel: (label) => `${translateLabel(label)} score`,
    errorPrefix: (query) => `Research failed for "${query}"`,
    noSuggestions: "No matching books",
    emptyQuery: "Enter a book title.",
    notFound: "Open Library could not find this book.",
    requestFailed: "A public data request failed.",
  },
  es: {
    brand: "Book Lens",
    title: "Investiga temas de libros y <span class=\"keep\">los puntúa</span>",
    intro: "Escribe el título de un libro para ver información básica, puntuaciones de 10 categorías, rango total y fuentes de investigación.",
    languageLabel: "Idioma",
    searchLabel: "Título del libro",
    searchPlaceholder: "p. ej. Harry Potter, Demian, 1984",
    searchButton: "Buscar",
    loadingButton: "Investigando",
    sampleButton: "Ejemplo",
    loadingNotice: "Investigando fuentes públicas.",
    emptyEyebrow: "Inicio",
    emptyTitle: "Busca un libro para analizar",
    emptyCopy: "El sitio busca datos del libro y del autor en Open Library, y complementa resúmenes y datos del autor con Wikipedia/Wikidata.",
    basicInfo: "Información básica",
    total: "Total",
    chartEyebrow: "Puntuaciones de 10 categorías",
    chartTitle: "Gráfico de presencia",
    evidenceEyebrow: "Fuentes consultadas",
    evidenceTitle: "Notas de puntuación",
    methodNote: "Las puntuaciones son estimaciones cualitativas según la frecuencia con que aparece cada tema en crítica literaria pública y ambientación.",
    scoreRange: (min, max) => `Rango ${min}-${max}`,
    meterLabel: (label) => `Puntuación de ${translateLabel(label)}`,
    errorPrefix: (query) => `Falló la investigación de "${query}"`,
    noSuggestions: "No hay libros coincidentes",
    emptyQuery: "Escribe el título de un libro.",
    notFound: "Open Library no encontró este libro.",
    requestFailed: "Falló una solicitud de datos públicos.",
  },
};

const labelTranslations = {
  "책 제목": { en: "Book title", es: "Título" },
  "도서 유형": { en: "Book type", es: "Tipo de libro" },
  "작가": { en: "Author", es: "Autor" },
  "장르": { en: "Genre", es: "Género" },
  "작가 정보": { en: "Author profile", es: "Perfil del autor" },
  "집필 기간과 체류 국가": { en: "Writing period and countries", es: "Periodo y países de escritura" },
  "시리즈 범위": { en: "Series scope", es: "Alcance de la serie" },
  "인종차별": { en: "Racism", es: "Racismo" },
  "정치": { en: "Politics", es: "Política" },
  "남성/여성 우월주의": { en: "Male/female supremacy", es: "Supremacía masculina/femenina" },
  "노예제도": { en: "Slavery", es: "Esclavitud" },
  "미신": { en: "Superstition", es: "Superstición" },
  "편견/고정관념": { en: "Prejudice/stereotypes", es: "Prejuicio/estereotipos" },
  "혐오": { en: "Hate", es: "Odio" },
  "사실 왜곡/각색": { en: "Distortion/adaptation", es: "Distorsión/adaptación" },
  "정보 오류": { en: "Information errors", es: "Errores de información" },
  "외모 지상주의": { en: "Lookism", es: "Aspectismo" },
  "시리즈": { en: "Series", es: "Serie" },
  "단행본": { en: "Standalone", es: "Libro independiente" },
};

const elements = {
  query: document.querySelector("#book-query"),
  searchButton: document.querySelector("#search-button"),
  sampleButton: document.querySelector("#sample-button"),
  languageSelect: document.querySelector("#language-select"),
  suggestions: document.querySelector("#suggestions-list"),
  notice: document.querySelector("#notice-panel"),
  emptyPanel: document.querySelector("#empty-panel"),
  resultGrid: document.querySelector("#result-grid"),
  bookTitle: document.querySelector("#book-title"),
  infoList: document.querySelector("#info-list"),
  totalScore: document.querySelector("#total-score"),
  rangeLabel: document.querySelector("#range-label"),
  rangeBand: document.querySelector("#range-band"),
  chart: document.querySelector("#chart"),
  evidenceList: document.querySelector("#evidence-list"),
};

let currentLanguage = "ko";
let lastAnalysis = null;

export function setLoading(isLoading) {
  elements.searchButton.disabled = isLoading;
  elements.sampleButton.disabled = isLoading;
  elements.searchButton.textContent = isLoading ? t("loadingButton") : t("searchButton");
  document.body.classList.toggle("is-loading", isLoading);
  if (isLoading) {
    showNotice(t("loadingNotice"));
  }
}

export function renderInitial() {
  lastAnalysis = null;
  resetTheme();
  elements.notice.hidden = true;
  elements.resultGrid.hidden = true;
  elements.emptyPanel.hidden = false;
  hideSuggestions();
}

export function renderResult(analysis) {
  const total = totalScore(analysis);
  lastAnalysis = analysis;
  document.body.style.setProperty("--theme-accent", analysis.theme.accent);
  document.body.style.setProperty("--theme-glow", analysis.theme.glow);
  if (analysis.signatureImage) {
    document.body.style.setProperty("--signature-image", `url("${analysis.signatureImage}")`);
  } else {
    document.body.style.removeProperty("--signature-image");
  }
  document.body.classList.add("has-result");
  document.body.dataset.signature = analysis.signature;
  elements.notice.hidden = true;
  elements.emptyPanel.hidden = true;
  elements.resultGrid.hidden = false;
  elements.bookTitle.textContent = analysis.title;
  elements.totalScore.textContent = String(total);
  renderInfo(analysis.info);
  renderRanges(total);
  renderChart(analysis.scores);
  renderEvidence(analysis.evidence);
}

export function renderError(query, message) {
  lastAnalysis = null;
  resetTheme();
  elements.resultGrid.hidden = true;
  elements.emptyPanel.hidden = false;
  showNotice(`${t("errorPrefix", query)}: ${message}`);
}

export function showNotice(message) {
  elements.notice.hidden = false;
  elements.notice.textContent = message;
}

export function setQuery(value) {
  elements.query.value = value;
}

export function currentQuery() {
  return elements.query.value.trim();
}

export function setLanguage(language) {
  currentLanguage = translations[language] ? language : "ko";
  document.documentElement.lang = currentLanguage;
  applyLanguage();
  if (lastAnalysis) {
    renderInfo(lastAnalysis.info);
    renderRanges(totalScore(lastAnalysis));
    renderChart(lastAnalysis.scores);
  }
}

export function renderSuggestions(suggestions) {
  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }
  elements.suggestions.hidden = false;
  elements.suggestions.replaceChildren(
    ...suggestions.map((suggestion) => {
      const button = document.createElement("button");
      button.className = "suggestion-button";
      button.type = "button";
      button.textContent = suggestion;
      button.dataset.suggestion = suggestion;
      return button;
    }),
  );
}

export function hideSuggestions() {
  elements.suggestions.hidden = true;
  elements.suggestions.replaceChildren();
}

export function translatedMessage(key) {
  return t(key);
}

export function suggestionTarget(event) {
  return event.target.closest("[data-suggestion]")?.dataset.suggestion ?? "";
}

function totalScore(analysis) {
  return analysis.scores.reduce((sum, [, score]) => sum + score, 0);
}

function resetTheme() {
  document.body.style.removeProperty("--theme-accent");
  document.body.style.removeProperty("--theme-glow");
  document.body.style.removeProperty("--signature-image");
  document.body.classList.remove("has-result");
  document.body.dataset.signature = "book";
}

function activeRange(total) {
  return scoreRanges.find(([min, max]) => total >= min && total <= max) ?? scoreRanges[0];
}

function renderInfo(info) {
  elements.infoList.replaceChildren(
    ...info.map(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = translateLabel(label);
      description.textContent = translateValue(value);
      row.append(term, description);
      return row;
    }),
  );
}

function renderRanges(total) {
  const [activeMin, activeMax] = activeRange(total);
  elements.rangeLabel.textContent = t("scoreRange", activeMin, activeMax);
  elements.rangeBand.replaceChildren(
    ...scoreRanges.map(([min, max]) => {
      const chip = document.createElement("span");
      chip.className = min === activeMin && max === activeMax ? "range-chip active" : "range-chip";
      chip.textContent = `${min}~${max}`;
      return chip;
    }),
  );
}

function renderChart(scores) {
  elements.chart.replaceChildren(...scores.map(renderChartRow));
}

function renderChartRow([label, score, reason]) {
  const row = document.createElement("div");
  row.className = "chart-row";

  const labelElement = document.createElement("div");
  labelElement.className = "chart-label";
  labelElement.textContent = translateLabel(label);

  const track = document.createElement("div");
  track.className = "meter-track";
  track.setAttribute("role", "meter");
  track.setAttribute("aria-label", t("meterLabel", label));
  track.setAttribute("aria-valuemin", "1");
  track.setAttribute("aria-valuemax", "10");
  track.setAttribute("aria-valuenow", String(score));

  const bar = document.createElement("div");
  bar.className = "meter-bar";
  bar.style.setProperty("--score", String(score));
  track.append(bar);

  const value = document.createElement("div");
  value.className = "meter-value";
  value.textContent = `${score}/10`;

  const reasonElement = document.createElement("p");
  reasonElement.className = "chart-reason";
  reasonElement.textContent = reason;

  row.append(labelElement, track, value, reasonElement);
  return row;
}

function renderEvidence(evidence) {
  elements.evidenceList.replaceChildren(
    ...evidence.map((source) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const note = document.createElement("p");
      link.className = "source-name";
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = source.name;
      note.className = "source-note";
      note.textContent = source.note;
      item.append(link, note);
      return item;
    }),
  );
}

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const value = t(key);
    if (key === "title") {
      element.innerHTML = value;
    } else {
      element.textContent = value;
    }
  });
  elements.query.placeholder = t("searchPlaceholder");
  elements.searchButton.textContent = document.body.classList.contains("is-loading") ? t("loadingButton") : t("searchButton");
  elements.sampleButton.textContent = t("sampleButton");
}

function t(key, ...args) {
  const value = translations[currentLanguage][key] ?? translations.ko[key] ?? "";
  return typeof value === "function" ? value(...args) : value;
}

function translateLabel(label) {
  return labelTranslations[label]?.[currentLanguage] ?? label;
}

function translateValue(value) {
  return labelTranslations[value]?.[currentLanguage] ?? value;
}
