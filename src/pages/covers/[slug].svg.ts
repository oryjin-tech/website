import type { APIRoute, GetStaticPaths } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { coverSvg } from "../../lib/covers";
import { guideSlug } from "../../lib/site";

/** /covers/<slug>.svg — the guide's generated cover, as a static file. */
export const getStaticPaths = (async () => {
	const guides = await getCollection("guides");
	return guides.map((guide) => ({ params: { slug: guideSlug(guide) }, props: { guide } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ guide: CollectionEntry<"guides"> }> = ({ props }) =>
	new Response(coverSvg(props.guide.data.cover, props.guide.data.pillar, guideSlug(props.guide)), {
		headers: { "Content-Type": "image/svg+xml" },
	});
