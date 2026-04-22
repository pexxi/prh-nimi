import Table from "cli-table3";
import type {
  CompanyNameHit,
  GeographicalHit,
  SearchResults,
  SectionKey,
  SectionSummary,
  SurnameHit,
  TrademarkHit,
} from "./schemas.js";

const ATTRIBUTION =
  "Data: PRH Nimipalvelu (nimipalvelu.prh.fi). Sources: PRH (trade register, trademark register), DVV (surnames), Maanmittauslaitos (geographical names).";

function summaryLine(label: string, summary: SectionSummary | null): string {
  if (!summary) return label;
  return `${label} (${summary.shown} / ${summary.total})`;
}

function truncateHits<T>(hits: T[], limit: number | undefined): T[] {
  return limit && limit > 0 ? hits.slice(0, limit) : hits;
}

function companiesTable(hits: CompanyNameHit[]): string {
  const table = new Table({ head: ["Name", "Business ID", "Type"] });
  for (const h of hits) table.push([h.name, h.businessId, h.type]);
  return table.toString();
}

function trademarksTable(hits: TrademarkHit[]): string {
  const table = new Table({ head: ["Trademark", "Reg. Number", "Nice Classes"] });
  for (const h of hits)
    table.push([h.name, h.registrationNumber, h.niceClasses.join(" ")]);
  return table.toString();
}

function nameOnlyTable(hits: Array<SurnameHit | GeographicalHit>): string {
  const table = new Table({ head: ["Name"] });
  for (const h of hits) table.push([h.name]);
  return table.toString();
}

export function formatTable(
  results: SearchResults,
  opts: { sections: Set<SectionKey>; limit?: number },
): string {
  const blocks: string[] = [];
  blocks.push(
    `Query: "${results.query}"  Lang: ${results.lang}  Total hits: ${results.totalHits ?? "?"}  Shown: ${results.shownHits ?? "?"}`,
  );

  if (opts.sections.has("companies")) {
    const hits = truncateHits(results.companies.hits, opts.limit);
    blocks.push(`\n${summaryLine("Companies", results.companies.summary)}`);
    blocks.push(hits.length ? companiesTable(hits) : "(no hits)");
  }
  if (opts.sections.has("trademarks")) {
    const hits = truncateHits(results.trademarks.hits, opts.limit);
    blocks.push(
      `\n${summaryLine("Trademarks (Finnish + IR; excludes EUIPO)", results.trademarks.summary)}`,
    );
    blocks.push(hits.length ? trademarksTable(hits) : "(no hits)");
  }
  if (opts.sections.has("surnames")) {
    const hits = truncateHits(results.surnames.hits, opts.limit);
    blocks.push(`\n${summaryLine("Surnames (DVV)", results.surnames.summary)}`);
    blocks.push(hits.length ? nameOnlyTable(hits) : "(no hits)");
  }
  if (opts.sections.has("geographical")) {
    const hits = truncateHits(results.geographical.hits, opts.limit);
    blocks.push(
      `\n${summaryLine("Geographical (Maanmittauslaitos)", results.geographical.summary)}`,
    );
    blocks.push(hits.length ? nameOnlyTable(hits) : "(no hits)");
  }

  blocks.push(`\n${ATTRIBUTION}`);
  return blocks.join("\n");
}

export function formatCompact(
  results: SearchResults,
  opts: { sections: Set<SectionKey>; limit?: number },
): string {
  const lines: string[] = [];
  lines.push(
    `query=${results.query}\tlang=${results.lang}\ttotal=${results.totalHits ?? "?"}\tshown=${results.shownHits ?? "?"}`,
  );

  if (opts.sections.has("companies")) {
    const sum = results.companies.summary;
    lines.push(`\n# companies${sum ? ` ${sum.shown}/${sum.total}` : ""}`);
    for (const h of truncateHits(results.companies.hits, opts.limit)) {
      lines.push(`${h.businessId}\t${h.name}\t${h.type}`);
    }
  }
  if (opts.sections.has("trademarks")) {
    const sum = results.trademarks.summary;
    lines.push(
      `\n# trademarks${sum ? ` ${sum.shown}/${sum.total}` : ""} (excludes EUIPO)`,
    );
    for (const h of truncateHits(results.trademarks.hits, opts.limit)) {
      lines.push(`${h.registrationNumber}\t${h.name}\t${h.niceClasses.join(" ")}`);
    }
  }
  if (opts.sections.has("surnames")) {
    const sum = results.surnames.summary;
    lines.push(`\n# surnames${sum ? ` ${sum.shown}/${sum.total}` : ""}`);
    for (const h of truncateHits(results.surnames.hits, opts.limit)) {
      lines.push(h.name);
    }
  }
  if (opts.sections.has("geographical")) {
    const sum = results.geographical.summary;
    lines.push(`\n# geographical${sum ? ` ${sum.shown}/${sum.total}` : ""}`);
    for (const h of truncateHits(results.geographical.hits, opts.limit)) {
      lines.push(h.name);
    }
  }

  lines.push(`\n# ${ATTRIBUTION}`);
  return lines.join("\n");
}

export function formatJson(
  results: SearchResults,
  opts: { sections: Set<SectionKey>; limit?: number },
): string {
  const filtered: Record<string, unknown> = {
    query: results.query,
    lang: results.lang,
    totalHits: results.totalHits,
    shownHits: results.shownHits,
  };
  for (const key of ["companies", "trademarks", "surnames", "geographical"] as const) {
    if (opts.sections.has(key)) {
      const section = results[key];
      filtered[key] = {
        summary: section.summary,
        hits: truncateHits(section.hits, opts.limit),
      };
    }
  }
  return JSON.stringify(filtered, null, 2);
}
