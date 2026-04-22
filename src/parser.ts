import { load } from "cheerio";
import type { CheerioAPI } from "cheerio";
import type {
  CompanyNameHit,
  GeographicalHit,
  Language,
  SearchResults,
  SectionSummary,
  SurnameHit,
  TrademarkHit,
} from "./schemas.js";

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function parseTotalHits($: CheerioAPI): {
  total: number | null;
  shown: number | null;
} {
  // Finnish: "Osumia löytyi yhteensä 780 kpl, joista hakutuloksessa näytetään 233 lähintä."
  // Swedish: "Sammanlagt 9 träffar, av vilka 9 är närmast."
  // English: "In total 9 hits, of which 9 are closest."
  // Strategy: extract all numbers from the summary paragraph; first = total, second = shown (if present).
  const text = normalizeText($(".large-text").first().text());
  const nums = Array.from(text.matchAll(/\d[\d\s]*/g))
    .map((m) => parseInt(m[0].replace(/\s/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  return {
    total: nums.length >= 1 ? nums[0] : null,
    shown: nums.length >= 2 ? nums[1] : nums[0] ?? null,
  };
}

const SECTION_SUMMARY_IDS: Record<string, string> = {
  companies: "#yritysBtn",
  trademarks: "#tmBtn",
  surnames: "#sukunimiBtn",
  geographical: "#geoBtn",
};

function parseSectionSummary(
  $: CheerioAPI,
  sectionKey: keyof typeof SECTION_SUMMARY_IDS,
): SectionSummary | null {
  const btn = $(SECTION_SUMMARY_IDS[sectionKey]).first();
  if (!btn.length) return null;
  const text = normalizeText(btn.text());
  // FI: "Yritykset, osumia 201 / 748 kpl"
  // SV: "Företag, träffar 1 / 1 st."
  // EN: "Companies, hits 8 of 8 total results"
  const match = text.match(/(\d[\d\s]*)\s*(?:\/|of)\s*(\d[\d\s]*)/i);
  if (!match) return null;
  const toNum = (s: string) => parseInt(s.replace(/\s/g, ""), 10);
  return { shown: toNum(match[1]), total: toNum(match[2]) };
}

function firstTbodyRows($: CheerioAPI, sectionId: string) {
  return $(sectionId).first().find("tbody").first().find("tr");
}

function parseCompanies($: CheerioAPI): CompanyNameHit[] {
  const hits: CompanyNameHit[] = [];
  firstTbodyRows($, "#collapseYritykset").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 3) return;
    hits.push({
      name: normalizeText($(tds[0]).text()),
      businessId: normalizeText($(tds[1]).text()),
      type: normalizeText($(tds[2]).text()),
    });
  });
  return hits;
}

function parseTrademarks($: CheerioAPI): TrademarkHit[] {
  const hits: TrademarkHit[] = [];
  firstTbodyRows($, "#collapseKotimaisetTavaramerkit").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 3) return;
    const classesText = normalizeText($(tds[2]).text());
    const niceClasses = classesText
      .split(/\s+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n));
    hits.push({
      name: normalizeText($(tds[0]).text()),
      registrationNumber: normalizeText($(tds[1]).text()),
      niceClasses,
    });
  });
  return hits;
}

function parseSingleColumn<T extends { name: string }>(
  $: CheerioAPI,
  sectionId: string,
): T[] {
  const hits: T[] = [];
  firstTbodyRows($, sectionId).each((_, el) => {
    const tds = $(el).find("td");
    if (!tds.length) return;
    const name = normalizeText($(tds[0]).text());
    if (name) hits.push({ name } as T);
  });
  return hits;
}

export function parseSearchResults(
  html: string,
  query: string,
  lang: Language,
): SearchResults {
  const $ = load(html);
  const { total, shown } = parseTotalHits($);

  return {
    query,
    lang,
    totalHits: total,
    shownHits: shown,
    companies: {
      summary: parseSectionSummary($, "companies"),
      hits: parseCompanies($),
    },
    trademarks: {
      summary: parseSectionSummary($, "trademarks"),
      hits: parseTrademarks($),
    },
    surnames: {
      summary: parseSectionSummary($, "surnames"),
      hits: parseSingleColumn<SurnameHit>($, "#collapseSukunimet"),
    },
    geographical: {
      summary: parseSectionSummary($, "geographical"),
      hits: parseSingleColumn<GeographicalHit>($, "#collapseMaantieteelliset"),
    },
  };
}
