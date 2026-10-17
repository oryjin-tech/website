#!/usr/bin/env node
/**
 * The SEO gate over the built site (dist/). Run after `astro build`, in CI and
 * before every deploy:
 *
 *   node scripts/check-site.mjs dist
 *
 * Fails on:
 *   - a URL from scripts/published-urls.txt that no longer resolves
 *   - a sitemap <loc> that does not resolve
 *   - a JSON-LD block that is not valid JSON
 *   - a page without exactly one <h1>, a <title>, a meta description, or a
 *     canonical that names the page itself
 *   - an internal href or src that points at nothing
 *   - an hreflang alternate that does not resolve or does not link back
 *   - a guide (an <article class="guide-body">) with fewer than three
 *     internal links
 * Warns (does not fail) on a <title> over 60 characters or a description
 * over 160, which search results truncate.
 *
 * No dependencies: the pages are our own, regular HTML, so regular
 * expressions are enough and keep this runnable anywhere Node is.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SITE = "https://oryjin.com";
const dist = process.argv[2] ?? "dist";
const errors = [];
const warnings = [];

/** A site path ("/x", "/x.html", "/p/", "/") to the file Pages would serve, or null. */
function resolve(path) {
	const clean = decodeURIComponent(path.split(/[?#]/)[0]);
	const candidates = clean.endsWith("/")
		? [join(dist, clean, "index.html")]
		: [join(dist, clean), join(dist, `${clean}.html`), join(dist, clean, "index.html")];
	return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

/** The URL a built HTML file is served at, in the form the site links to it. */
function urlOf(file) {
	let p = `/${relative(dist, file)}`;
	if (p.endsWith("/index.html")) p = p.slice(0, -"index.html".length);
	else if (p.endsWith(".html") && !STATIC_HTML_URLS.has(p)) p = p.slice(0, -".html".length);
	return p;
}
/** Hand-written pages linked with their extension, as they always have been. */
const STATIC_HTML_URLS = new Set(["/privacy.html"]);

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const unescape = (s) =>
	s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// 1. Every published URL still resolves.
const published = readFileSync(new URL("./published-urls.txt", import.meta.url), "utf8")
	.split("\n")
	.map((l) => l.trim())
	.filter((l) => l && !l.startsWith("#"));
for (const url of published) {
	if (!resolve(url)) errors.push(`published URL ${url} no longer resolves`);
}

// 2. Every sitemap entry resolves.
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
	if (!loc.startsWith(SITE)) errors.push(`sitemap: ${loc} is not on ${SITE}`);
	else if (!resolve(loc.slice(SITE.length) || "/")) errors.push(`sitemap: ${loc} does not resolve`);
}

// 3. Per page.
const pages = walk(dist).filter((f) => f.endsWith(".html"));
const alternatesOf = new Map();
for (const file of pages) {
	const html = readFileSync(file, "utf8");
	const url = urlOf(file);
	const where = `${url} (${relative(dist, file)})`;
	if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;

	for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
		try {
			JSON.parse(json);
		} catch (e) {
			errors.push(`${where}: JSON-LD does not parse (${e.message})`);
		}
	}

	const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
	if (h1 !== 1) errors.push(`${where}: ${h1} <h1> elements, expected 1`);

	const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
	if (!title) errors.push(`${where}: no <title>`);
	else if (unescape(title).length > 60) warnings.push(`${where}: <title> is ${unescape(title).length} characters`);

	const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
	if (!description) errors.push(`${where}: no meta description`);
	else if (unescape(description).length > 160)
		warnings.push(`${where}: description is ${unescape(description).length} characters`);

	const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
	const expected = `${SITE}${url}`;
	if (!canonical) errors.push(`${where}: no canonical`);
	else if (canonical !== expected) errors.push(`${where}: canonical ${canonical}, expected ${expected}`);

	const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
		([, lang, href]) => ({ lang, href }),
	);
	alternatesOf.set(expected, alternates);

	for (const [, tag] of html.matchAll(/<(?:a|link|script|img|source)\s([^>]*)>/g)) {
		const ref = attr(` ${tag}`, "href") ?? attr(` ${tag}`, "src");
		if (!ref || /^(https?:|mailto:|tel:|data:|#|javascript:)/.test(ref) || ref.startsWith("//")) {
			if (ref?.startsWith(SITE) && !resolve(ref.slice(SITE.length) || "/"))
				errors.push(`${where}: link ${ref} points at nothing`);
			continue;
		}
		const base = url.endsWith("/") ? url : url.slice(0, url.lastIndexOf("/") + 1);
		const target = ref.startsWith("/") ? ref : base + ref;
		if (!resolve(unescape(target))) errors.push(`${where}: link ${ref} points at nothing`);
	}

	const article = html.match(/<article class="guide-body">([\s\S]*?)<\/article>/)?.[1];
	if (article && /<meta property="og:type" content="article"/.test(html)) {
		const internal = [...article.matchAll(/<a\s[^>]*href="([^"]+)"/g)].filter(
			([, h]) => h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/#"),
		).length;
		if (internal < 3) errors.push(`${where}: ${internal} internal links in the article, expected at least 3`);
	}
}

// 4. hreflang: every alternate resolves and links back.
for (const [page, alternates] of alternatesOf) {
	for (const { lang, href } of alternates) {
		if (!href.startsWith(SITE) || !resolve(href.slice(SITE.length) || "/")) {
			errors.push(`${page}: hreflang ${lang} → ${href} does not resolve`);
			continue;
		}
		if (href === page) continue;
		const back = alternatesOf.get(href) ?? [];
		if (!back.some((a) => a.href === page)) errors.push(`${page}: hreflang ${lang} → ${href} does not link back`);
	}
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${pages.length} pages, ${published.length} published URLs: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length > 0 ? 1 : 0);
