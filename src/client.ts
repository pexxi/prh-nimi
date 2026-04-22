import type { Language } from "./schemas.js";

const BASE_URL = "https://nimipalvelu.prh.fi/nipa";
const USER_AGENT = "nimi-cli (+https://github.com/pexxi/nimi)";

export class NimiApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Nimipalvelu error (${status}): ${body.slice(0, 200)}`);
    this.name = "NimiApiError";
  }
}

export class NimiClient {
  private baseUrl: string;

  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async search(name: string, lang: Language = "fi"): Promise<string> {
    const body = new URLSearchParams({ jooei: "joo", kieli: lang, nimi: name });

    const res = await fetch(`${this.baseUrl}/hakutulokset/${lang}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html",
        "User-Agent": USER_AGENT,
      },
      body: body.toString(),
    });

    if (!res.ok) {
      throw new NimiApiError(res.status, await res.text());
    }

    return res.text();
  }
}
