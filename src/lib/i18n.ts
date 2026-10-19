import type { Locale } from "./site";

/**
 * The fixed words of a guide page. The French column uses the app's
 * vocabulary (oryjin-tech/core src/integrations/i18n/GLOSSARY.md, mirrored by
 * hand): vouvoiement, sentence case, no exclamation marks. The site's nav and
 * footer are still English-only; translating them is slice 2 of the plan.
 */
export const GUIDE_COPY = {
	en: {
		crumbGuides: "Guides",
		kicker: "Guide",
		minRead: (n: number) => `${n} min read`,
		updated: (when: string) => `Updated ${when}`,
		byline: "By the Oryjin team",
		faq: "Questions on this topic",
		related: "Keep reading",
		relatedLabel: "Related guides",
		apply: "Get early access",
		sample: "Try it live",
		takeaways: "Key takeaways",
		toc: "In this guide",
		share: "Share",
		copyLink: "Copy link",
		copied: "Link copied",
		writtenBy: "Written by",
		allGuides: "All guides",
		newsletterTitle: "The Payment Economics",
		newsletterText: "One independent study a month on what payment acceptance really costs in Europe.",
		newsletterCta: "Subscribe",
	},
	fr: {
		crumbGuides: "Guides",
		kicker: "Guide",
		minRead: (n: number) => `${n} min de lecture`,
		updated: (when: string) => `Mis à jour en ${when}`,
		byline: "Par l'équipe Oryjin",
		faq: "Questions sur ce sujet",
		related: "À lire ensuite",
		relatedLabel: "Guides liés",
		apply: "Obtenir un accès anticipé",
		sample: "Essayer en direct",
		takeaways: "L'essentiel",
		toc: "Dans ce guide",
		share: "Partager",
		copyLink: "Copier le lien",
		copied: "Lien copié",
		writtenBy: "Écrit par",
		allGuides: "Tous les guides",
		newsletterTitle: "The Payment Economics",
		newsletterText: "Une étude indépendante par mois sur ce que coûte vraiment l'acceptation des paiements en Europe.",
		newsletterCta: "S'abonner",
	},
} satisfies Record<Locale, Record<string, unknown>>;

export const PILLARS = {
	en: {
		costs: {
			title: "Payment processing costs",
			intro:
				"What a card payment costs, layer by layer: interchange, scheme fees, the acquirer's markup, FX and the per-event fees, which of them are capped, and how to negotiate the part that is.",
		},
		acceptance: {
			title: "Payment acceptance and losses",
			intro:
				"The payments that fail, are disputed or are lost to fraud: how to measure them, what they cost, and the thresholds the card schemes hold you to.",
		},
		strategy: {
			title: "Payment strategy for finance teams",
			intro:
				"Checking what you are billed against what you signed, forecasting next quarter's fees, and deciding when the payment stack needs to change.",
		},
	},
	fr: {
		costs: {
			title: "Coûts de traitement des paiements",
			intro:
				"Ce que coûte un paiement par carte, couche par couche : interchange, frais de réseau, marge de l'acquéreur, change et frais par événement, lesquels sont plafonnés, et comment négocier ceux qui ne le sont pas.",
		},
		acceptance: {
			title: "Acceptation des paiements et pertes",
			intro:
				"Les paiements refusés, contestés ou perdus à la fraude : comment les mesurer, ce qu'ils coûtent et les seuils que les réseaux imposent.",
		},
		strategy: {
			title: "Stratégie de paiement pour les équipes finance",
			intro:
				"Rapprocher ce qui est facturé de ce qui a été signé, prévoir les frais du trimestre et décider quand la chaîne de paiement doit changer.",
		},
	},
} as const;

export const PILLAR_ORDER = ["costs", "acceptance", "strategy"] as const;

export const HUB_PATH: Record<Locale, string> = { en: "/learn", fr: "/fr/learn" };
