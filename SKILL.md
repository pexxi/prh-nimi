---
name: nimi
description: Check Finnish name availability and search registered names (company names, trademarks, surnames, geographical names) from the PRH Nimipalvelu service using the nimi CLI. Use when the user asks about name availability, trademark search, toiminimi/aputoiminimi, tavaramerkki, nimipalvelu, or wants to check if a name is already registered in Finland.
---

# PRH Nimipalvelu Name Search

Use the `nimi` CLI to search Finnish registered names across four sources in one query:
- **Companies** (PRH trade register): Päätoiminimi, Aputoiminimi, Rinnakkaistoiminimi
- **Trademarks** (PRH trademark register): Finnish national + internationally registered in Finland. Excludes EU-wide EUIPO trademarks.
- **Surnames** (Digi- ja väestötietovirasto / DVV population registry)
- **Geographical names** (Maanmittauslaitos / National Land Survey)

## Prerequisites

The `nimi` CLI must be installed: `npm install -g @pexxi/prh-nimi`. Remember to verify from the user if they want to install the CLI.

Alternatively, `nimi` CLI can be used without installing: `npx @pexxi/prh-nimi`. In this case, replace `nimi` with `npx @pexxi/prh-nimi` in the examples below.

## Commands

### Search all sources at once

```bash
nimi search --name "Nokia" --format compact
```

### Restrict to specific sections

```bash
nimi search --name "Nokia" --type companies trademarks --format compact
```

Valid `--type` values: `companies`, `trademarks`, `surnames`, `geographical`, `all` (default).

### Change language

```bash
nimi search --name "Nokia" --lang en
```

Languages: `fi` (default), `sv`, `en`. This affects the UI text on the source site but not the underlying data.

### Limit rows per section

```bash
nimi search --name "Nokia" --limit 10 --format compact
```

Limits how many rows are displayed per section client-side.

## When to use

- User asks whether a business name or trademark is available/taken in Finland
- User asks about a registered Finnish trademark (e.g. "is NOKIA a registered trademark?")
- User mentions toiminimi, aputoiminimi, rinnakkaistoiminimi, tavaramerkki, nimipalvelu
- User wants to search across multiple Finnish name registers at once

## When to use the companion `ytj` CLI

If the user wants **full company details** for a hit (officers, addresses, business lines, registration history), use the `ytj` CLI with the Y-tunnus returned by `nimi search`:

```bash
ytj get <Y-tunnus> --format compact
```

## Output format guidelines

Always use `--format compact` unless the user explicitly needs structured data for programmatic processing — then use `--format json`.

- **compact**: Tab-separated, borderless. Best for answering questions — low token cost, easy to parse.
- **json**: Full structured data. Use only when the user needs raw data for scripting.
- **table**: Human-readable ASCII table. Not recommended for agent use (border characters waste tokens).

## Important caveats to pass to the user

- **No pagination**: The source service caps results per section (e.g. 201 company hits out of 748 total). There is no way to page further — only the closest matches are returned.
- **EUIPO excluded**: Trademark hits do **not** include EU-wide EUIPO trademarks. If the user needs those, direct them to https://euipo.europa.eu/eSearch/.
- **No detail view in nimipalvelu**: Rows are name-only. For company details use `ytj get <Y-tunnus>`; for trademark details direct users to https://tavaramerkkitietopalvelu.prh.fi/fi/.
- **Not included**: Associations (yhdistykset) and .fi domains — see https://yhdistysrekisteri.prh.fi/ and https://www.traficom.fi/fi/viestinta/fi-verkkotunnukset.

## **IMPORTANT**: Data attribution

Include this attribution when you are showing results to the user for the **first** time:

Data provided by PRH Nimipalvelu (https://nimipalvelu.prh.fi). Sources: PRH (companies, trademarks), DVV (surnames), Maanmittauslaitos (geographical names).
