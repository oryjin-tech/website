import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absolute, guidePath } from "../lib/site";

/**
 * llms.txt (llmstxt.org): the hand-written description of Oryjin in
 * src/llms-header.txt, then the guides, generated so a new one cannot be
 * forgotten.
 */
export const GET: APIRoute = async () => {
	const header = await readFile(join(process.cwd(), "src/llms-header.txt"), "utf8");
	const guides = (await getCollection("guides", (g) => g.data.locale === "en")).sort(
		(a, b) => a.data.order - b.data.order,
	);
	const lines = [
		`- All guides, by topic: ${absolute("/learn")}`,
		`- How the guides source their figures: ${absolute("/methodology")}`,
		...guides.map((g) => `- ${g.data.title}: ${absolute(guidePath(g))}`),
	];
	return new Response(`${header}\n## Guides\n${lines.join("\n")}\n`, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
