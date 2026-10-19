import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

/**
 * The 1200x630 social card of a hub page, rendered at build time: the brand
 * navy of og-navy.png, the lockup in white, the guide's kicker and title.
 * Plus Jakarta Sans is the site's own face; satori reads WOFF, not WOFF2.
 */
// Resolved from the project root: at build time this module runs from a bundle
// under dist/, where paths relative to it point nowhere.
const root = process.cwd();
const require = createRequire(join(root, "package.json"));
const font = (weight: number) =>
	readFile(require.resolve(`@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${weight}-normal.woff`));

let assets: Promise<{ regular: Buffer; bold: Buffer; lockup: string }> | undefined;
function load() {
	assets ??= (async () => {
		const svg = await readFile(join(root, "public/brand/oryjin-lockup.svg"), "utf8");
		const white = svg.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#FFFFFF"');
		return {
			regular: await font(500),
			bold: await font(700),
			lockup: `data:image/svg+xml;base64,${Buffer.from(white).toString("base64")}`,
		};
	})();
	return assets;
}

const NAVY = "#141C2E";
const SKY = "#8FB2FF";

/**
 * With a cover (a guide's, from src/lib/covers.ts), the cover fills the card
 * and a navy scrim on the left carries the text; without one, the plain navy
 * card the hub's other pages use.
 */
export async function ogImage(
	kicker: string,
	title: string,
	opts: { cover?: string; byline?: string; kickerColour?: string } = {},
): Promise<Buffer> {
	const { regular, bold, lockup } = await load();
	const withCover = Boolean(opts.cover);
	const size = withCover
		? title.length > 70 ? 46 : title.length > 50 ? 52 : 58
		: title.length > 70 ? 52 : title.length > 50 ? 58 : 66;
	const cover = opts.cover
		? `data:image/png;base64,${new Resvg(opts.cover, { fitTo: { mode: "width", value: 1200 } }).render().asPng().toString("base64")}`
		: null;
	const layer = (style: Record<string, unknown>, children?: unknown) => ({ type: "div", props: { style: { display: "flex", ...style }, children } });
	const tree = layer(
		{ position: "relative", width: 1200, height: 630, background: NAVY, fontFamily: "Jakarta", color: "#FFFFFF" },
		[
			...(cover ? [{ type: "img", props: { src: cover, width: 1200, height: 630, style: { position: "absolute", left: 0, top: 0 } } }] : []),
			...(cover
				? [layer({ position: "absolute", left: 0, top: 0, width: 1200, height: 630, backgroundImage: `linear-gradient(90deg, ${NAVY} 0%, rgba(20,28,46,0.94) 46%, rgba(20,28,46,0.35) 72%, rgba(20,28,46,0) 100%)` })]
				: []),
			layer(
				{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, flexDirection: "column", padding: "64px 80px" },
				[
					{ type: "img", props: { src: lockup, width: 200, height: 54 } },
					layer({ flexDirection: "column", gap: 22, width: withCover ? 700 : 1040, marginTop: withCover ? 110 : 150 }, [
						layer({ fontSize: 26, fontWeight: 500, color: opts.kickerColour ?? SKY, letterSpacing: 1 }, kicker),
						layer({ fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5 }, title),
						...(opts.byline ? [layer({ fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.72)", marginTop: 6 }, opts.byline)] : []),
					]),
				],
			),
		],
	);
	const svg = await satori(tree as Parameters<typeof satori>[0], {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Jakarta", data: regular, weight: 500, style: "normal" },
			{ name: "Jakarta", data: bold, weight: 700, style: "normal" },
		],
	});
	return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
