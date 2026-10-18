/**
 * The pages that are not guides, for the sitemap. Hand-written pages under
 * public/ are listed here too: Astro does not know about them. `lastmod` is a
 * literal, bumped when the page's content changes — never the build clock,
 * which would mark every page modified on every deploy.
 */
export interface StaticPage {
	path: string;
	lastmod: string;
	changefreq: "weekly" | "monthly" | "yearly";
	priority: number;
	/** hreflang alternates beyond the page itself. */
	alternates?: { hreflang: string; path: string }[];
}

export const STATIC_PAGES: StaticPage[] = [
	{
		path: "/",
		lastmod: "2026-09-26",
		changefreq: "monthly",
		priority: 1.0,
		alternates: [
			{ hreflang: "en", path: "/" },
			{ hreflang: "x-default", path: "/" },
		],
	},
	{ path: "/learn", lastmod: "2026-10-17", changefreq: "weekly", priority: 0.8 },
	{ path: "/authors/oryjin-team", lastmod: "2026-10-17", changefreq: "monthly", priority: 0.4 },
	{ path: "/methodology", lastmod: "2026-10-17", changefreq: "yearly", priority: 0.4 },
	{ path: "/privacy.html", lastmod: "2026-09-26", changefreq: "yearly", priority: 0.3 },
];
