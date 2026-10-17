import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { STATIC_PAGES } from "../lib/pages";
import { absolute, guidePath, isoDate } from "../lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

interface Url {
	loc: string;
	lastmod: string;
	changefreq: string;
	priority: number;
	alternates: { hreflang: string; href: string }[];
}

export const GET: APIRoute = async () => {
	const guides = await getCollection("guides");
	const fileName = (id: string) => id.split("/").pop()!;
	const urls: Url[] = STATIC_PAGES.map((p) => ({
		loc: absolute(p.path),
		lastmod: p.lastmod,
		changefreq: p.changefreq,
		priority: p.priority,
		alternates: (p.alternates ?? []).map((a) => ({ hreflang: a.hreflang, href: absolute(a.path) })),
	}));
	for (const g of guides) {
		const englishName = g.data.locale === "en" ? fileName(g.id) : g.data.translationOf;
		const family = guides.filter((o) =>
			o.data.locale === "en" ? fileName(o.id) === englishName : o.data.translationOf === englishName,
		);
		const english = family.find((o) => o.data.locale === "en");
		urls.push({
			loc: absolute(guidePath(g)),
			lastmod: isoDate(g.data.updated),
			changefreq: "monthly",
			priority: 0.7,
			alternates:
				family.length > 1
					? [
							...family.map((o) => ({ hreflang: o.data.locale, href: absolute(guidePath(o)) })),
							...(english ? [{ hreflang: "x-default", href: absolute(guidePath(english)) }] : []),
						]
					: [],
		});
	}
	urls.sort((a, b) => b.priority - a.priority || a.loc.localeCompare(b.loc));
	const body = urls
		.map(
			(u) => `  <url>
    <loc>${esc(u.loc)}</loc>
${u.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}"/>\n`).join("")}    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`,
		)
		.join("\n");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`,
		{ headers: { "Content-Type": "application/xml" } },
	);
};
