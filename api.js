import { emptyAuthor, fetchAuthorProfile } from "./author.js";
import { normalizeTitle, seriesCatalog, titleAliases } from "./catalog.js";

const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const WIKIPEDIA_SEARCH_URL = "https://en.wikipedia.org/w/api.php";

export async function fetchBookResearch(query) {
  const series = findSeries(query);
  if (series) {
    return fetchSeriesResearch(series);
  }
  const candidates = searchCandidates(query);
  const book = await fetchBestOpenLibraryBook(candidates) ?? await fetchWikipediaBook(candidates);
  const [authorResult, summaryResult] = await Promise.allSettled([
    fetchAuthorProfile(book.authorName),
    fetchBestWikipediaSummary([book.title, ...candidates]),
  ]);
  return {
    book,
    author: authorResult.status === "fulfilled" ? authorResult.value : emptyAuthor(),
    summary: summaryResult.status === "fulfilled" ? summaryResult.value : emptySummary(book.title),
  };
}

function findSeries(query) {
  const normalized = normalizeTitle(query);
  return seriesCatalog.get(normalized) ?? seriesCatalog.get(normalized.replace(/\s+/g, ""));
}

async function fetchSeriesResearch(series) {
  const settled = await Promise.allSettled(series.queries.map(fetchSingleBookResearch));
  const items = settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  if (items.length === 0) {
    throw new Error("book_not_found");
  }
  const primary = items[0];
  return {
    book: aggregateSeriesBook(series, items),
    author: primary.author,
    summary: aggregateSeriesSummary(series, items),
  };
}

async function fetchSingleBookResearch(query) {
  const candidates = searchCandidates(query);
  const book = await fetchBestOpenLibraryBook(candidates) ?? await fetchWikipediaBook(candidates);
  const [authorResult, summaryResult] = await Promise.allSettled([
    fetchAuthorProfile(book.authorName),
    fetchBestWikipediaSummary([book.title, ...candidates]),
  ]);
  return {
    book,
    author: authorResult.status === "fulfilled" ? authorResult.value : emptyAuthor(),
    summary: summaryResult.status === "fulfilled" ? summaryResult.value : emptySummary(book.title),
  };
}

function aggregateSeriesBook(series, items) {
  const books = items.map((item) => item.book);
  const years = books.map((book) => book.firstPublishYear).filter(Boolean);
  return {
    title: series.title,
    authorName: uniqueText(books.map((book) => book.authorName)).join(", "),
    authorKey: books[0]?.authorKey ?? "",
    firstPublishYear: years.length > 0 ? Math.min(...years) : null,
    subjects: uniqueText(books.flatMap((book) => book.subjects)).slice(0, 80),
    places: uniqueText(books.flatMap((book) => book.places)).slice(0, 12),
    people: uniqueText(books.flatMap((book) => book.people)).slice(0, 16),
    times: uniqueText(books.flatMap((book) => book.times)).slice(0, 10),
    openLibraryUrl: books[0]?.openLibraryUrl ?? "",
    coverUrl: books[0]?.coverUrl ?? "",
    seriesItems: books.map((book) => book.title),
    signature: series.signature,
  };
}

function aggregateSeriesSummary(series, items) {
  return {
    title: series.title,
    extract: items.map((item) => item.summary.extract).filter(Boolean).join(" "),
    url: items[0]?.summary.url ?? "",
  };
}

function searchCandidates(query) {
  const normalized = normalizeTitle(query);
  const alias = titleAliases.get(normalized);
  return [...new Set([alias, query.trim()].filter(Boolean))];
}

async function fetchBestOpenLibraryBook(candidates) {
  for (const candidate of candidates) {
    const book = await fetchOpenLibraryBookSafely(candidate);
    if (book && hasUsefulBookData(book)) {
      return book;
    }
  }
  for (const candidate of candidates) {
    const book = await fetchOpenLibraryBookSafely(candidate);
    if (book) {
      return book;
    }
  }
  return null;
}

async function fetchOpenLibraryBookSafely(query) {
  try {
    return await fetchOpenLibraryBook(query);
  } catch {
    return null;
  }
}

async function fetchOpenLibraryBook(query) {
  const params = new URLSearchParams({
    q: query,
    limit: "1",
    fields: "key,title,author_name,author_key,first_publish_year,subject,place,person,time,language,cover_i",
  });
  const data = await fetchJson(`${OPEN_LIBRARY_SEARCH_URL}?${params.toString()}`);
  const [firstBook] = data.docs ?? [];
  if (!firstBook) {
    return null;
  }
  return {
    title: firstBook.title ?? query,
    authorName: firstBook.author_name?.[0] ?? "공개 데이터 없음",
    authorKey: firstBook.author_key?.[0] ?? "",
    firstPublishYear: firstBook.first_publish_year ?? null,
    subjects: firstBook.subject?.slice(0, 40) ?? [],
    places: firstBook.place?.slice(0, 8) ?? [],
    people: firstBook.person?.slice(0, 8) ?? [],
    times: firstBook.time?.slice(0, 6) ?? [],
    openLibraryUrl: `https://openlibrary.org${firstBook.key ?? ""}`,
    coverUrl: firstBook.cover_i ? `https://covers.openlibrary.org/b/id/${firstBook.cover_i}-L.jpg` : "",
  };
}

async function fetchWikipediaBook(candidates) {
  const summary = await fetchBestWikipediaSummary(candidates);
  if (!summary.extract) {
    throw new Error("book_not_found");
  }
  return {
    title: summary.title,
    authorName: "공개 데이터 없음",
    authorKey: "",
    firstPublishYear: null,
    subjects: keywordSubjects(summary.extract),
    places: [],
    people: [],
    times: [],
    openLibraryUrl: summary.url,
    coverUrl: "",
  };
}

async function fetchWikipediaSummary(title) {
  const url = `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(title)}`;
  try {
    const data = await fetchJson(url);
    return {
      title: data.title ?? title,
      extract: data.extract ?? "",
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return { title, extract: "", url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` };
  }
}

async function fetchBestWikipediaSummary(candidates) {
  try {
    for (const candidate of candidates) {
      const direct = await fetchWikipediaSummary(candidate);
      if (direct.extract) {
        return direct;
      }
    }
    for (const candidate of candidates) {
      const pageTitle = await searchWikipediaTitle(candidate);
      if (pageTitle) {
        const summary = await fetchWikipediaSummary(pageTitle);
        if (summary.extract) {
          return summary;
        }
      }
    }
  } catch {
    return emptySummary(candidates[0] ?? "");
  }
  return emptySummary(candidates[0] ?? "");
}

async function searchWikipediaTitle(query) {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `${query} book novel`,
    format: "json",
    origin: "*",
    srlimit: "1",
  });
  const data = await fetchJson(`${WIKIPEDIA_SEARCH_URL}?${params.toString()}`);
  return data.query?.search?.[0]?.title ?? "";
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`request_failed:${response.status}`);
  }
  return response.json();
}

function hasUsefulBookData(book) {
  return book.authorName !== "공개 데이터 없음" || book.subjects.length > 0 || book.firstPublishYear;
}

function keywordSubjects(text) {
  const lower = text.toLowerCase();
  const subjects = [];
  for (const keyword of ["fantasy", "science fiction", "political", "novel", "war", "romance", "horror", "history"]) {
    if (lower.includes(keyword)) {
      subjects.push(keyword);
    }
  }
  return subjects;
}

function emptySummary(title) {
  return { title, extract: "", url: "" };
}

function uniqueText(values) {
  return [...new Set(values.filter(Boolean).filter((value) => value !== "공개 데이터 없음"))];
}
