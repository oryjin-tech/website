import type { APIRoute, GetStaticPaths } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { GUIDE_COPY } from "../../../lib/i18n";
import { ogImage } from "../../../lib/og-image";
import { authorOf } from "../../../lib/authors";
import { coverSvg } from "../../../lib/covers";
import { guideSlug } from "../../../lib/site";

export const getStaticPaths = (async () => {
	const guides = await getCollection("guides");
	return guides.map((guide) => ({
		params: { locale: guide.data.locale, slug: guideSlug(guide) },
		props: { guide },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ guide: CollectionEntry<"guides"> }> = async ({ props }) => {
	const { data } = props.guide;
	const author = authorOf(data.author);
	const png = await ogImage(`${GUIDE_COPY[data.locale].kicker} · ${data.label}`, data.title, {
		cover: coverSvg(data.cover, guideSlug(props.guide)),
		byline: `${author.name} · ${GUIDE_COPY[data.locale].minRead(data.readingMinutes)}`,
	});
	return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
