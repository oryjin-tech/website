// @ts-check
import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://oryjin.com",
	// `file` writes /scheme-fees-interchange.html, which GitHub Pages serves at
	// /scheme-fees-interchange — the URLs the site has had since September 2026.
	build: { format: "file" },
	trailingSlash: "never",
	markdown: {
		// The guides' text is published as written: straight quotes stay straight.
		processor: satteri({ features: { smartPunctuation: false } }),
	},
});
