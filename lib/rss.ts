import Parser from "rss-parser";

const parser = new Parser({ timeout: 10_000 });

// Candidate feeds. The first that returns items wins.
// FCB official site doesn't publish a documented RSS, so we fall back through
// reputable English sources. Each is best-effort; failures are swallowed.
const FEEDS = [
  "https://www.fcbarcelona.com/en/rss/news",
  "https://www.fcbarcelona.com/en/rss",
  "https://www.espn.com/espn/rss/soccer/team?id=83",
  "https://www.football-espana.net/category/barcelona/feed",
];

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  source: string;
  snippet?: string;
}

export async function getNews(limit = 8): Promise<NewsItem[]> {
  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      const items = (feed.items ?? [])
        .slice(0, limit)
        .map<NewsItem>((it) => ({
          title: it.title ?? "",
          link: it.link ?? "",
          pubDate: it.pubDate,
          source: feed.title ?? url,
          snippet: (it.contentSnippet ?? it.content ?? "").slice(0, 240),
        }))
        .filter((i) => i.title && i.link);
      if (items.length > 0) return items;
    } catch {
      // try next feed
    }
  }
  return [];
}
