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

export async function ogImage(kicker: string, title: string): Promise<Buffer> {
	const { regular, bold, lockup } = await load();
	const size = title.length > 70 ? 52 : title.length > 50 ? 58 : 66;
	const tree = {
		type: "div",
		props: {
			style: {
				width: 1200,
				height: 630,
				display: "flex",
				flexDirection: "column",
				justifyContent: "flex-start",
				padding: "72px 80px",
				background: NAVY,
				fontFamily: "Jakarta",
				color: "#FFFFFF",
			},
			children: [
				{ type: "img", props: { src: lockup, width: 222, height: 60 } },
				{
					type: "div",
					props: {
						style: { display: "flex", flexDirection: "column", gap: 24, width: 1040, marginTop: 150 },
						children: [
							{
								type: "div",
								props: {
									style: { fontSize: 28, fontWeight: 500, color: SKY, letterSpacing: 1 },
									children: kicker,
								},
							},
							{
								type: "div",
								props: {
									style: { width: 1040, fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5 },
									children: title,
								},
							},
						],
					},
				},
			],
		},
	};
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
