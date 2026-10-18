/**
 * The people who sign the guides. A finance reader judges a page on who wrote
 * it, so every guide carries a named byline, an author card and a schema.org
 * Person (oryjin-tech/core docs/plans/payment-knowledge-hub.md, standard 7).
 *
 * `photo` is a root-relative path under public/ (square, 512px or more). Until
 * one is committed the byline draws the initials on the brand gradient.
 *
 * A byline is a person or, with `organization`, the team: schema.org then
 * names an Organization instead of a Person.
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
	email?: string;
	/** The team rather than a person. */
	organization?: boolean;
}

export const AUTHORS: Record<string, Author> = {
	"oryjin-team": {
		key: "oryjin-team",
		name: "The Oryjin team",
		initials: "O",
		role: "Oryjin, Paris",
		short: "The team building Oryjin, the independent payment cockpit for European merchants.",
		bio: [
			"Oryjin gives European merchants an independent reading of what their payments cost: every fee, every loss and every routing choice, checked against the contracts they signed.",
			"The team writes these guides from what the product reads in real PSP invoices and from the schemes' published schedules, and checks every figure before a guide ships. Corrections are welcome at contact@oryjin.com.",
		],
		photo: "/brand/oryjin-tile-square.svg",
		linkedin: "https://www.linkedin.com/company/oryjin-payment-intelligence",
		email: "contact@oryjin.com",
		organization: true,
	},
};

/** schema.org for a byline: a Person at Oryjin, or Oryjin itself. */
export function authorSchema(a: Author, url: string, image?: string) {
	const shared = {
		name: a.name,
		description: a.short,
		url,
		...(image ? { image } : {}),
		...(a.linkedin ? { sameAs: [a.linkedin] } : {}),
		...(a.email ? { email: a.email } : {}),
	};
	return a.organization
		? { "@type": "Organization", ...shared }
		: { "@type": "Person", ...shared, jobTitle: a.role, worksFor: { "@type": "Organization", name: "Oryjin", url: "https://oryjin.com/" } };
}

export function authorOf(key: string): Author {
	const author = AUTHORS[key];
	if (!author) throw new Error(`Unknown author "${key}": add it to src/lib/authors.ts`);
	return author;
}

export const authorPath = (a: Author) => `/authors/${a.key}`;
