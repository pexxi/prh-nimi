# @pexxi/prh-nimi

CLI and Agent skill for the Finnish PRH **Nimipalvelu** name search service.

Searches four Finnish name registers in one query:

- **Companies** — PRH trade register (Päätoiminimi, Aputoiminimi, Rinnakkaistoiminimi)
- **Trademarks** — Finnish national and internationally registered in Finland (excludes EUIPO)
- **Surnames** — Digi- ja väestötietovirasto (DVV)
- **Geographical names** — Maanmittauslaitos

## Usage with npx

```bash
npx @pexxi/prh-nimi search --name "Nokia"
npx @pexxi/prh-nimi search --name "Nokia" --type companies trademarks --format compact
npx @pexxi/prh-nimi search --name "Nokia" --format json --limit 20
```

## Global Install

```bash
npm install -g @pexxi/prh-nimi
```

After installing globally, the `nimi` command is available directly:

```bash
nimi search --name "Nokia"
```

## CLI

### search -- search registered names

```bash
nimi search --name "Nokia"
nimi search --name "Nokia" --type companies
nimi search --name "Nokia" --type trademarks surnames
nimi search --name "Nokia" --lang en --format compact
nimi search --name "Nokia" --limit 10
```

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Name to search (required) |
| `-l, --lang <lang>` | Source language: `fi` (default), `sv`, `en` |
| `-t, --type <types...>` | Sections to include: `companies`, `trademarks`, `surnames`, `geographical`, `all` (default) |
| `-f, --format <format>` | Output format: `table` (default), `compact`, `json` |
| `--limit <n>` | Max rows per section (client-side) |

### Agent skill usage

For AI agent / automation consumption, use `--format compact` — it produces tab-separated, borderless output optimized for low token cost and easy parsing. See `SKILL.md` for the full integration guide.

## Library Usage

```bash
npm install @pexxi/prh-nimi
```

```typescript
import { NimiClient, parseSearchResults } from "@pexxi/prh-nimi";

const client = new NimiClient();
const html = await client.search("Nokia", "fi");
const results = parseSearchResults(html, "Nokia", "fi");

console.log(results.companies.summary);        // { shown: 201, total: 748 }
console.log(results.companies.hits[0]);         // { name, businessId, type }
console.log(results.trademarks.hits[0]);        // { name, registrationNumber, niceClasses: number[] }
```

## How it works

The source service at https://nimipalvelu.prh.fi does not expose a JSON API. This tool:

1. Submits an HTTP POST to `/nipa/hakutulokset/{lang}` with the query form-encoded.
2. Parses the returned HTML with `cheerio`.
3. Normalizes rows from the four result tables into typed records.

## Caveats

- **No pagination.** The service caps results per section (e.g. 201 of 748 hits returned). No way to fetch deeper matches.
- **EUIPO excluded.** Trademark results do not include EU-wide EUIPO trademarks.
- **No detail view.** For company details, use the companion [`@pexxi/ytj`](https://github.com/pexxi/ytj) CLI with the returned Y-tunnus.

## Agent Skill

See `SKILL.md` for the AI agent integration guide.

## Data License

Data sources:
- PRH trade register and trademark register — https://www.prh.fi/
- Digi- ja väestötietovirasto (DVV) — https://dvv.fi/
- Maanmittauslaitos — https://www.maanmittauslaitos.fi/

Attribute PRH, DVV, and Maanmittauslaitos as the data sources when using results from this tool.

## License

MIT (tool code).
