/**
 * The people who sign the guides. A finance reader judges a page on who wrote
 * it, so every guide carries a named byline, an author card and a schema.org
 * Person (oryjin-tech/core docs/plans/payment-knowledge-hub.md, standard 7).
 *
 * `photo` is a root-relative path under public/ (square, 512px or more). Until
 * one is committed the byline draws the initials on the brand gradient.
 */
export interface Author {
	key: string;
	name: string;
	initials: string;
	role: string;
	/** One sentence, under the name in the byline's card and on the hub. */
	short: string;
	/** The author page's paragraphs. */
	bio: string[];
	photo?: string;
	linkedin?: string;
}

export const AUTHORS: Record<string, Author> = {
	"victor-morel": {
		key: "victor-morel",
		name: "Victor Morel",
		initials: "VM",
		role: "Founder, Oryjin",
		short: "Founder of Oryjin. Writes the guides and checks every figure in them.",
		bio: [
			"Victor founded Oryjin to give European merchants an independent reading of what their payments cost: every fee, every loss and every routing choice, checked against the contracts they signed.",
			"He writes these guides from what the product reads in real PSP invoices and from the schemes' published schedules, and he checks every figure before a guide ships. Corrections are welcome at contact@oryjin.com.",
		],
	},
};

export function authorOf(key: string): Author {
	const author = AUTHORS[key];
	if (!author) throw new Error(`Unknown author "${key}": add it to src/lib/authors.ts`);
	return author;
}

export const authorPath = (a: Author) => `/authors/${a.key}`;
