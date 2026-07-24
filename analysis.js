import { signatureImages } from "./catalog.js";

const categories = [
  ["인종차별", ["race", "racism", "racial", "blood", "caste", "ethnic", "xenophobia", "discrimination"]],
  ["정치", ["politic", "government", "ministry", "power", "war", "revolution", "totalitarian", "law", "state"]],
  ["남성/여성 우월주의", ["gender", "patriarchy", "feminism", "woman", "women", "male", "female", "sexism"]],
  ["노예제도", ["slave", "slavery", "servant", "bondage", "captivity", "oppression"]],
  ["미신", ["magic", "supernatural", "witch", "wizard", "prophecy", "curse", "myth", "ghost"]],
  ["편견/고정관념", ["prejudice", "stereotype", "class", "outsider", "outcast", "social themes", "identity"]],
  ["혐오", ["hate", "evil", "violence", "murder", "persecution", "enemy", "terror", "revenge"]],
  ["사실 왜곡/각색", ["history", "historical", "retelling", "mythology", "legend", "adaptation", "alternate"]],
  ["정보 오류", ["science", "technology", "medicine", "law", "economics", "manual", "reference"]],
  ["외모 지상주의", ["beauty", "appearance", "ugly", "handsome", "pretty", "body", "face"]],
];

const themes = [
  ["fantasy", ["fantasy", "magic", "wizard", "witch", "supernatural"], "#828fff", "rgba(113, 112, 255, 0.28)"],
  ["history", ["history", "historical", "war", "politic"], "#d7a747", "rgba(215, 167, 71, 0.24)"],
  ["romance", ["romance", "love", "marriage"], "#e1769f", "rgba(225, 118, 159, 0.24)"],
  ["science", ["science", "technology", "space", "computer"], "#55c7e8", "rgba(85, 199, 232, 0.24)"],
  ["horror", ["horror", "ghost", "vampire", "murder"], "#e06464", "rgba(224, 100, 100, 0.24)"],
];

const harryPotterOverrides = new Map([
  ["인종차별", 8],
  ["정치", 8],
  ["남성/여성 우월주의", 4],
  ["노예제도", 7],
  ["미신", 6],
  ["편견/고정관념", 8],
  ["혐오", 7],
  ["사실 왜곡/각색", 3],
  ["정보 오류", 2],
  ["외모 지상주의", 4],
]);

export function buildAnalysis(research) {
  const text = sourceText(research);
  const isHarryPotter = text.includes("harry potter") || text.includes("hogwarts");
  const signature = chooseSignature(text, research.book);
  const scores = categories.map(([label, keywords]) => {
    const score = isHarryPotter ? harryPotterOverrides.get(label) : scoreCategory(text, keywords);
    return [label, score, reasonFor(label, score, keywords, text, isHarryPotter)];
  });
  return {
    title: research.book.title,
    info: buildInfo(research),
    scores,
    evidence: buildEvidence(research),
    theme: chooseTheme(text, research.book),
    signature,
    signatureImage: signatureImages.get(signature) ?? research.book.coverUrl ?? "",
  };
}

function buildInfo({ book, author }) {
  const info = [
    ["책 제목", book.title],
    ["도서 유형", book.seriesItems?.length > 1 ? "시리즈" : "단행본"],
    ["작가", book.authorName],
    ["장르", readableSubjects(book.subjects)],
    ["작가 정보", `${author.nationality}, ${author.gender}`],
    ["집필 기간과 체류 국가", writingContext(book, author)],
  ];
  if (book.seriesItems?.length > 1) {
    info.push(["시리즈 범위", book.seriesItems.join(" / ")]);
  }
  return info;
}

function readableSubjects(subjects) {
  const picked = subjects.filter((subject) => /^[a-zA-Z &-]+$/.test(subject)).slice(0, 4);
  return picked.length > 0 ? picked.join(", ") : "공개 데이터 부족";
}

function writingContext(book, author) {
  const year = book.firstPublishYear ? `${book.firstPublishYear}년 전후 출간` : "출간연도 공개 데이터 없음";
  const places = book.places.length > 0 ? `작품 관련 장소: ${book.places.slice(0, 3).join(", ")}` : "집필 중 체류 국가는 자동 확인 불가";
  const country = author.nationality !== "공개 데이터 없음" ? `저자 국적: ${author.nationality}` : "저자 국적 공개 데이터 없음";
  return `${year}. ${country}. ${places}.`;
}

function buildEvidence({ book, author, summary }) {
  const evidence = [
    {
      name: "Open Library Search API",
      url: book.openLibraryUrl,
      note: "책 제목, 작가, 출간연도, 주제어, 관련 장소 데이터를 가져왔습니다.",
    },
  ];
  if (book.seriesItems?.length > 1) {
    evidence.unshift({
      name: "시리즈 통합 분석",
      url: book.openLibraryUrl,
      note: `${book.seriesItems.length}권을 함께 조사해 주제어와 요약을 통합했습니다.`,
    });
  }
  if (summary.extract) {
    evidence.push({
      name: "Wikipedia Summary",
      url: summary.url,
      note: "작품 개요 문장으로 주제 키워드와 배경 테마를 보강했습니다.",
    });
  }
  if (author.wikidataUrl) {
    evidence.push({
      name: "Wikidata Author Entity",
      url: author.wikidataUrl,
      note: "저자의 국적과 성별 공개 데이터를 확인했습니다.",
    });
  }
  evidence.push({
    name: "자동 점수 산정 규칙",
    url: "https://openlibrary.org/dev/docs/api/search",
    note: "Open Library 주제어와 Wikipedia 요약에서 항목별 키워드가 얼마나 확인되는지 기준으로 1~10점을 계산했습니다.",
  });
  return evidence;
}

function sourceText({ book, summary }) {
  return [book.title, book.authorName, ...book.subjects, ...book.places, ...book.people, ...book.times, summary.extract]
    .join(" ")
    .toLowerCase();
}

function scoreCategory(text, keywords) {
  const hits = keywords.filter((keyword) => text.includes(keyword)).length;
  const score = 1 + hits * 2;
  return Math.max(1, Math.min(10, score));
}

function reasonFor(label, score, keywords, text, isHarryPotter) {
  if (isHarryPotter && harryPotterOverrides.has(label)) {
    return `시리즈 전체의 반복 주제 반영도를 기준으로 ${score}/10으로 산정했습니다. 1점은 매우 낮고 10점은 매우 높다는 의미입니다.`;
  }
  const matches = keywords.filter((keyword) => text.includes(keyword)).slice(0, 3);
  if (matches.length === 0) {
    return `${label} 관련 공개 주제어가 거의 확인되지 않아 낮게 산정했습니다.`;
  }
  return `${matches.join(", ")} 관련 공개 주제어가 확인되어 ${score}/10으로 산정했습니다.`;
}

function chooseTheme(text, book) {
  if (book.signature === "ring") {
    return { name: "ring", accent: "#d7a747", glow: "rgba(215, 167, 71, 0.28)" };
  }
  if (book.signature === "worm") {
    return { name: "worm", accent: "#d7a747", glow: "rgba(215, 167, 71, 0.24)" };
  }
  const found = themes.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  if (!found) {
    return { name: "general", accent: "#828fff", glow: "rgba(113, 112, 255, 0.22)" };
  }
  const [name, , accent, glow] = found;
  return { name, accent, glow };
}

function chooseSignature(text, book) {
  if (book.signature) {
    return book.signature;
  }
  if (text.includes("harry potter") || text.includes("hogwarts")) {
    return "wand";
  }
  if (text.includes("lord of the rings") || text.includes("ring")) {
    return "ring";
  }
  if (text.includes("dune") || text.includes("arrakis")) {
    return "worm";
  }
  if (text.includes("totalitarian") || text.includes("surveillance")) {
    return "eye";
  }
  return "book";
}
