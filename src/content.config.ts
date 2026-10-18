import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * One guide per file, under `guides/<locale>/`. A translation is a second
 * file in the other locale's folder that names the English file in
 * `translationOf`; the hreflang pairs are derived from that link, never typed
 * by hand.
 */
const guides = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
	schema: z
		.object({
			/** The H1, og:title and schema.org headline. */
			title: z.string(),
			/** The <title>, before " | Oryjin". The query first, ~60 characters. */
			seoTitle: z.string(),
			/** Meta description: states the answer, ~155 characters. */
			description: z.string(),
			/** The kicker after "Guide · ". */
			label: z.string(),
			/** The footer's and the hub's short name. */
			shortTitle: z.string(),
			lede: z.string(),
			readingMinutes: z.number().int().positive(),
			published: z.coerce.date(),
			updated: z.coerce.date(),
			pillar: z.enum(["costs", "acceptance", "strategy"]),
			/** Order in the footer and inside a pillar on the hub. */
			order: z.number().int(),
			locale: z.enum(["en", "fr"]).default("en"),
			/** French guides translate the slug; English ones use the file name. */
			slug: z.string().optional(),
			/** On a translation: the English file's name. */
			translationOf: z.string().optional(),
			cta: z.object({ headline: z.string(), text: z.string() }),
			faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
			/** File names of related guides in the same locale, in display order. */
			related: z.array(z.string()).default([]),
			/** Key of the byline in src/lib/authors.ts. */
			author: z.string().default("oryjin-team"),
			/** Three to four sentences a reader can stop after; shown above the body. */
			takeaways: z.array(z.string()).default([]),
			/**
			 * The motif of the generated cover (src/lib/covers.ts), used for the
			 * hero, the cards and the social card.
			 */
			cover: z.enum(["layers", "network", "timeline", "fan", "threshold"]),
			/**
			 * A sentence from the body, repeated large where the body carries a
			 * `[[pullquote]]` paragraph. Decorative: hidden from screen readers.
			 */
			pullQuote: z.string().optional(),
		})
		.refine((g) => g.locale === "en" || (g.slug && g.translationOf), {
			message: "A translated guide needs its own `slug` and the English file in `translationOf`",
		}),
});

export const collections = { guides };
