const WIKIDATA_SEARCH_URL = "https://www.wikidata.org/w/api.php";
const WIKIDATA_ENTITY_URL = "https://www.wikidata.org/wiki/Special:EntityData";

export async function fetchAuthorProfile(authorName) {
  if (!authorName || authorName === "공개 데이터 없음") {
    return emptyAuthor();
  }
  try {
    const wikidata = await fetchWikidataAuthor(authorName);
    if (wikidata) {
      return wikidata;
    }
  } catch {
    return emptyAuthor();
  }
  return emptyAuthor();
}

export function emptyAuthor() {
  return {
    nationality: "공개 데이터 없음",
    gender: "공개 데이터 없음",
    wikidataUrl: "",
  };
}

async function fetchWikidataAuthor(authorName) {
  const searchParams = new URLSearchParams({
    action: "wbsearchentities",
    search: authorName,
    language: "en",
    format: "json",
    origin: "*",
    limit: "1",
  });
  const search = await fetchJson(`${WIKIDATA_SEARCH_URL}?${searchParams.toString()}`);
  const entityId = search.search?.[0]?.id;
  if (!entityId) {
    return null;
  }
  const entity = await fetchJson(`${WIKIDATA_ENTITY_URL}/${entityId}.json`);
  const claims = entity.entities?.[entityId]?.claims ?? {};
  return {
    nationality: await claimLabel(claims.P27?.[0]),
    gender: await claimLabel(claims.P21?.[0]),
    wikidataUrl: `https://www.wikidata.org/wiki/${entityId}`,
  };
}

async function claimLabel(claim) {
  const id = claim?.mainsnak?.datavalue?.value?.id;
  if (!id) {
    return "공개 데이터 없음";
  }
  try {
    const entity = await fetchJson(`${WIKIDATA_ENTITY_URL}/${id}.json`);
    return entity.entities?.[id]?.labels?.ko?.value
      ?? entity.entities?.[id]?.labels?.en?.value
      ?? "공개 데이터 없음";
  } catch {
    return "공개 데이터 없음";
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`request_failed:${response.status}`);
  }
  return response.json();
}
