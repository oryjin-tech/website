import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absolute, guidePath } from "../lib/site";

const esc = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The English guides, newest first. A French feed comes with the French guides. */
export const GET: APIRoute = async () => {
	const guides = (await getCollection("guides", (g) => g.data.locale === "en")).sort(
		(a, b) => b.data.published.getTime() - a.data.published.getTime() || a.data.order - b.data.order,
	);
	const items = guides
		.map(
			(g) => `    <item>
      <title>${esc(g.data.title)}</title>
      <link>${absolute(guidePath(g))}</link>
      <guid isPermaLink="true">${absolute(guidePath(g))}</guid>
      <pubDate>${g.data.published.toUTCString()}</pubDate>
      <description>${esc(g.data.description)}</description>
    </item>`,
		)
		.join("\n");
	const latest = guides.reduce((d, g) => (g.data.updated > d ? g.data.updated : d), new Date(0));
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Oryjin guides: payment economics</title>
    <link>${absolute("/learn")}</link>
    <atom:link href="${absolute("/rss.xml")}" rel="self" type="application/rss+xml"/>
    <description>Guides for finance teams on what payments cost and how to lower it.</description>
    <language>en</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`,
		{ headers: { "Content-Type": "application/rss+xml" } },
	);
};
