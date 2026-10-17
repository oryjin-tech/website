import type { CollectionEntry } from "astro:content";

export const SITE = {
	name: "Oryjin",
	url: "https://oryjin.com",
	appUrl: "https://app.oryjin.com",
} as const;

export type Locale = "en" | "fr";

/** `https://oryjin.com` + a root-relative path; absolute URLs pass through. */
export function absolute(pathOrUrl: string): string {
	if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
	return pathOrUrl === "/" ? `${SITE.url}/` : `${SITE.url}${pathOrUrl}`;
}

/**
 * A guide's slug: its own `slug` field (a French guide translates it), else
 * its file name. Slugs never change once published — GitHub Pages has no
 * redirects.
 */
export function guideSlug(guide: CollectionEntry<"guides">): string {
	return guide.data.slug ?? guide.id.split("/").pop()!;
}

/** `/<slug>` for English, `/fr/<slug>` for French. */
export function guidePath(guide: CollectionEntry<"guides">): string {
	const slug = guideSlug(guide);
	return guide.data.locale === "en" ? `/${slug}` : `/${guide.data.locale}/${slug}`;
}

/**
 * A link into the app carrying the funnel's parameters
 * (oryjin-tech/core docs/decisions/marketing-analytics-funnel.md);
 * site-analytics.js appends the visitor's own utm_* and click ids on load.
 */
export function appLink(path: string, content: string): string {
	const q = new URLSearchParams({
		source: "website",
		utm_source: "website",
		utm_medium: "cta",
		utm_content: content,
	});
	return `${SITE.appUrl}${path}?${q.toString()}`;
}

const MONTH_YEAR: Record<Locale, Intl.DateTimeFormat> = {
	en: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }),
	fr: new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }),
};

export function monthYear(date: Date, locale: Locale): string {
	return MONTH_YEAR[locale].format(date);
}

/** YYYY-MM-DD, the form schema.org dates and the sitemap use. */
export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
