import { program } from "commander";
import { NimiClient } from "./client.js";
import { parseSearchResults } from "./parser.js";
import { formatCompact, formatJson, formatTable } from "./formatter.js";
import {
  LanguageSchema,
  SectionKeySchema,
  type Language,
  type SectionKey,
} from "./schemas.js";

const ALL_SECTIONS: SectionKey[] = [
  "companies",
  "trademarks",
  "surnames",
  "geographical",
];

function parseSections(values: string[] | undefined): Set<SectionKey> {
  if (!values || values.length === 0 || values.includes("all")) {
    return new Set(ALL_SECTIONS);
  }
  const out = new Set<SectionKey>();
  for (const v of values) {
    const parsed = SectionKeySchema.safeParse(v);
    if (!parsed.success) {
      throw new Error(
        `Invalid --type value: "${v}". Allowed: ${ALL_SECTIONS.join(", ")}, all`,
      );
    }
    out.add(parsed.data);
  }
  return out;
}

function parseLang(value: string): Language {
  const parsed = LanguageSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Invalid --lang value: "${value}". Allowed: fi, sv, en`);
  }
  return parsed.data;
}

program
  .name("nimi")
  .description(
    "Finnish PRH Nimipalvelu name search CLI (company names, trademarks, surnames, geographical names).\nData: PRH, DVV, Maanmittauslaitos.",
  )
  .version("0.1.0");

program
  .command("search")
  .description("Search registered names across companies, trademarks, surnames, and geographical names")
  .option("-n, --name <name>", "Name to search")
  .option("-l, --lang <lang>", "Language (fi, sv, en)", "fi")
  .option(
    "-t, --type <types...>",
    `Sections to include: ${ALL_SECTIONS.join(", ")}, all`,
    ["all"],
  )
  .option("-f, --format <format>", "Output format (table, compact, json)", "table")
  .option("--limit <n>", "Max rows per section (client-side)", (v) => parseInt(v, 10))
  .action(async (opts) => {
    const name: string | undefined =
      typeof opts.name === "string" ? opts.name.trim() : undefined;
    if (!name) {
      throw new Error("--name is required");
    }
    const lang = parseLang(opts.lang);
    const sections = parseSections(opts.type);
    const limit: number | undefined =
      typeof opts.limit === "number" && Number.isFinite(opts.limit)
        ? opts.limit
        : undefined;

    const client = new NimiClient();
    const html = await client.search(name, lang);
    const results = parseSearchResults(html, name, lang);

    const formatOpts = { sections, limit };
    let output: string;
    switch (opts.format) {
      case "json":
        output = formatJson(results, formatOpts);
        break;
      case "compact":
        output = formatCompact(results, formatOpts);
        break;
      case "table":
        output = formatTable(results, formatOpts);
        break;
      default:
        throw new Error(
          `Invalid --format value: "${opts.format}". Allowed: table, compact, json`,
        );
    }
    console.log(output);
  });

program.parseAsync().catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
