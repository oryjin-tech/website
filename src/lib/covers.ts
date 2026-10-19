/**
 * A guide's cover: a 1200x630 SVG on the brand navy, the kit's three colours
 * as light washes, and one motif per topic drawn in light strokes. No text,
 * so the same file serves the article hero and the hub cards
 * (served at /covers/<slug>.svg) and the background of the social card
 * (src/lib/og-image.ts). Generated, never hand-drawn, so a new guide gets
 * one by naming its motif in frontmatter.
 *
 * The mark never appears here: the brand gradient is for surfaces, and a
 * cover is a surface.
 *
 * All three colours wash every cover, but the guide's pillar leads: its
 * colour fills the middle and the other two sit in the corners, so the
 * covers of one pillar read as a family on the hub and the social card
 * carries the pillar's tint in its kicker.
 */

export type CoverMotif = "layers" | "network" | "timeline" | "fan" | "threshold";
export type Pillar = "costs" | "acceptance" | "strategy";

export const COVER_W = 1200;
export const COVER_H = 630;

const NAVY = "#141C2E";
const NAVY_DEEP = "#0B1120";
// The kit's teal, blue and purple for the washes; lighter tints of the same
// hues for strokes, which must read on navy (the kit colours themselves are
// tuned for white).
const TEAL = "#037E8F";
const BLUE = "#1652D9";
const PURPLE = "#6302CC";
const TEAL_LT = "#5FD0DC";
const BLUE_LT = "#8FB2FF";
const PURPLE_LT = "#C49BFF";

/**
 * The pillar's colour, as site.css maps it (costs teal, acceptance purple,
 * strategy blue), with the light tint that reads on navy: the cover's lead
 * wash and the social card's kicker.
 */
export const PILLAR_COLOURS: Record<Pillar, { base: string; light: string; wash: string }> = {
	costs: { base: TEAL, light: TEAL_LT, wash: "gTeal" },
	acceptance: { base: PURPLE, light: PURPLE_LT, wash: "gPurple" },
	strategy: { base: BLUE, light: BLUE_LT, wash: "gBlue" },
};

const f = (n: number) => Math.round(n * 10) / 10;

/** A small deterministic generator, so a cover never changes between builds. */
function rng(seed: string) {
	let h = 2166136261;
	for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
	return () => {
		h = Math.imul(h ^ (h >>> 15), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		h ^= h >>> 16;
		return (h >>> 0) / 4294967296;
	};
}

function defs(): string {
	return `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="${NAVY_DEEP}"/></linearGradient>
  <radialGradient id="gTeal" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${TEAL}" stop-opacity="0.75"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gBlue" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${BLUE}" stop-opacity="0.85"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gPurple" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${PURPLE}" stop-opacity="0.7"/><stop offset="1" stop-color="${PURPLE}" stop-opacity="0"/></radialGradient>
  <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${TEAL_LT}"/><stop offset="0.55" stop-color="${BLUE_LT}"/><stop offset="1" stop-color="${PURPLE_LT}"/></linearGradient>
  <linearGradient id="fillV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLUE_LT}" stop-opacity="0.55"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0.05"/></linearGradient>
  <linearGradient id="slab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${TEAL}"/><stop offset="0.55" stop-color="${BLUE}"/><stop offset="1" stop-color="${PURPLE}"/></linearGradient>
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#FFFFFF" fill-opacity="0.07"/></pattern>
</defs>`;
}

function backdrop(r: () => number, pillar: Pillar): string {
	const jx = () => f((r() - 0.5) * 120);
	const lead = PILLAR_COLOURS[pillar].wash;
	const [corner1, corner2] = ["gPurple", "gBlue", "gTeal"].filter((id) => id !== lead);
	return `<rect width="${COVER_W}" height="${COVER_H}" fill="url(#bg)"/>
<ellipse cx="${f(1000 + jx())}" cy="${f(80 + jx() / 2)}" rx="460" ry="340" fill="url(#${corner1})" opacity="0.8"/>
<ellipse cx="${f(110 + jx())}" cy="${f(610 + jx() / 2)}" rx="460" ry="340" fill="url(#${corner2})" opacity="0.8"/>
<ellipse cx="${f(640 + jx())}" cy="${f(320 + jx() / 2)}" rx="720" ry="520" fill="url(#${lead})"/>
<rect width="${COVER_W}" height="${COVER_H}" fill="url(#dots)"/>`;
}

/** Six cost layers stacked in isometric slabs; two in solid blue are the contract's. */
function layers(): string {
	const cx = 790;
	const hw = 230; // half width of a slab's top face
	const hh = 92; // half height (2:1 isometric)
	const t = 20; // thickness
	const gap = 46;
	const base = 470;
	const contract = new Set([2, 4]); // markup, per-event: the contract's lines
	let out = "";
	for (let i = 0; i < 6; i++) {
		const y = base - i * gap;
		const L = `${cx - hw},${y}`;
		const T = `${cx},${y - hh}`;
		const R = `${cx + hw},${y}`;
		const B = `${cx},${y + hh}`;
		const Lt = `${cx - hw},${y + t}`;
		const Rt = `${cx + hw},${y + t}`;
		const Bt = `${cx},${y + hh + t}`;
		const solid = contract.has(i);
		const top = i === 5 ? "url(#slab)" : solid ? BLUE : "#FFFFFF";
		const topOpacity = i === 5 ? 0.95 : solid ? 0.9 : 0.06;
		out += `<g>
  <polygon points="${L} ${B} ${Bt} ${Lt}" fill="${solid ? "#0E3BA3" : "#FFFFFF"}" fill-opacity="${solid ? 0.95 : 0.04}" stroke="${BLUE_LT}" stroke-opacity="0.45" stroke-width="1.2"/>
  <polygon points="${B} ${R} ${Rt} ${Bt}" fill="${solid ? "#0A2E85" : "#FFFFFF"}" fill-opacity="${solid ? 0.95 : 0.02}" stroke="${BLUE_LT}" stroke-opacity="0.45" stroke-width="1.2"/>
  <polygon points="${L} ${T} ${R} ${B}" fill="${top}" fill-opacity="${topOpacity}" stroke="${i === 5 ? "#FFFFFF" : BLUE_LT}" stroke-opacity="${i === 5 ? 0.6 : 0.55}" stroke-width="1.4"/>
</g>`;
	}
	// Leader ticks on the right, one per layer.
	for (let i = 0; i < 6; i++) {
		const y = base - i * gap + 10;
		out += `<line x1="${cx + hw + 26}" y1="${y}" x2="${cx + hw + 96}" y2="${y}" stroke="url(#stroke)" stroke-width="2" stroke-linecap="round" stroke-opacity="${contract.has(i) ? 1 : 0.45}"/>`;
		out += `<circle cx="${cx + hw + 26}" cy="${y}" r="3.5" fill="${contract.has(i) ? BLUE_LT : "#FFFFFF"}" fill-opacity="${contract.has(i) ? 1 : 0.5}"/>`;
	}
	return out;
}

/** Issuer, scheme, acquirer, merchant: four nodes, the payment's path and its tolls. */
function network(r: () => number): string {
	const nodes = [
		{ x: 520, y: 430, r: 34 },
		{ x: 700, y: 230, r: 46 },
		{ x: 900, y: 380, r: 38 },
		{ x: 1060, y: 190, r: 30 },
	];
	let out = "";
	for (let i = 0; i < nodes.length - 1; i++) {
		const a = nodes[i];
		const b = nodes[i + 1];
		const mx = (a.x + b.x) / 2;
		const my = Math.min(a.y, b.y) - 70;
		out += `<path d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}" fill="none" stroke="url(#stroke)" stroke-width="3" stroke-linecap="round"/>`;
		// Toll: a short drop from the arc's apex.
		const ax = f((a.x + 2 * mx + b.x) / 4);
		const ay = f((a.y + 2 * my + b.y) / 4);
		out += `<line x1="${ax}" y1="${ay}" x2="${ax}" y2="${f(ay + 56)}" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="3 5"/>`;
		out += `<circle cx="${ax}" cy="${f(ay + 62)}" r="5" fill="${PURPLE_LT}" fill-opacity="0.9"/>`;
	}
	// Faint secondary routes.
	for (let k = 0; k < 7; k++) {
		const x1 = f(420 + r() * 700);
		const y1 = f(90 + r() * 450);
		const x2 = f(420 + r() * 700);
		const y2 = f(90 + r() * 450);
		out += `<path d="M${x1},${y1} Q${f((x1 + x2) / 2 + 60)},${f((y1 + y2) / 2 - 80)} ${x2},${y2}" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="1.2"/>`;
	}
	for (const [i, n] of nodes.entries()) {
		out += `<circle cx="${n.x}" cy="${n.y}" r="${n.r + 22}" fill="none" stroke="#FFFFFF" stroke-opacity="0.09"/>`;
		out += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${i === 1 ? "url(#slab)" : NAVY}" stroke="${BLUE_LT}" stroke-opacity="0.8" stroke-width="2"/>`;
		out += `<circle cx="${n.x}" cy="${n.y}" r="${f(n.r * 0.32)}" fill="#FFFFFF" fill-opacity="${i === 1 ? 0.95 : 0.7}"/>`;
	}
	return out;
}

/** A year on a line, the renewal window lit, milestones inside it. */
function timeline(): string {
	const x0 = 360;
	const x1 = 1130;
	const y = 330;
	let out = "";
	// Twelve month cells as a calendar strip.
	const cw = (x1 - x0) / 12;
	for (let i = 0; i < 12; i++) {
		const x = f(x0 + i * cw + 4);
		const lit = i >= 8;
		out += `<rect x="${x}" y="${y - 70}" width="${f(cw - 8)}" height="140" rx="10" fill="${lit ? "url(#fillV)" : "#FFFFFF"}" fill-opacity="${lit ? 1 : 0.05}" stroke="${lit ? BLUE_LT : "#FFFFFF"}" stroke-opacity="${lit ? 0.7 : 0.12}" stroke-width="1.5"/>`;
	}
	const w0 = x0 + cw * 8;
	out += `<rect x="${f(w0 - 6)}" y="${y - 86}" width="${f(x1 - w0 + 12)}" height="172" rx="16" fill="none" stroke="url(#stroke)" stroke-width="3"/>`;
	out += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2"/>`;
	out += `<line x1="${f(w0)}" y1="${y}" x2="${x1}" y2="${y}" stroke="url(#stroke)" stroke-width="6" stroke-linecap="round"/>`;
	const steps = [0.1, 0.36, 0.62, 0.86];
	const colors = [TEAL_LT, BLUE_LT, BLUE_LT, PURPLE_LT];
	for (const [i, st] of steps.entries()) {
		const x = f(w0 + (x1 - w0) * st);
		const up = i % 2 === 0;
		const ty = up ? y - 128 : y + 128;
		out += `<line x1="${x}" y1="${y}" x2="${x}" y2="${ty}" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="2"/>`;
		out += `<circle cx="${x}" cy="${ty}" r="13" fill="${colors[i]}"/><circle cx="${x}" cy="${ty}" r="24" fill="none" stroke="${colors[i]}" stroke-opacity="0.4" stroke-width="2"/>`;
		out += `<circle cx="${x}" cy="${y}" r="8" fill="#FFFFFF"/>`;
	}
	out += `<circle cx="${x1}" cy="${y}" r="20" fill="${NAVY}" stroke="#FFFFFF" stroke-width="4"/><circle cx="${x1}" cy="${y}" r="8" fill="#FFFFFF"/>`;
	return out;
}

/** History, then a forecast fanning out into its P10-P90 band. */
function fan(r: () => number): string {
	const x0 = 360;
	const split = 830;
	const x1 = 1150;
	const pts: [number, number][] = [];
	let y = 430;
	for (let x = x0; x <= split; x += 47) {
		y += (r() - 0.62) * 46;
		pts.push([x, f(Math.max(250, Math.min(470, y)))]);
	}
	const [sx, sy] = pts[pts.length - 1];
	const end = { x: x1, y: sy - 120 };
	const hi = `${x1},${end.y - 120}`;
	const lo = `${x1},${end.y + 105}`;
	let out = "";
	// Gridlines.
	for (let i = 0; i < 5; i++) {
		const gy = 170 + i * 80;
		out += `<line x1="${x0}" y1="${gy}" x2="${x1}" y2="${gy}" stroke="#FFFFFF" stroke-opacity="0.06"/>`;
	}
	out += `<line x1="${split}" y1="140" x2="${split}" y2="520" stroke="#FFFFFF" stroke-opacity="0.3" stroke-dasharray="4 6"/>`;
	out += `<path d="M${sx},${sy} L${hi} L${lo} Z" fill="url(#fillV)" stroke="none"/>`;
	out += `<path d="M${sx},${sy} Q${f((sx + x1) / 2)},${f(sy - 140)} ${hi}" fill="none" stroke="${PURPLE_LT}" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="5 6"/>`;
	out += `<path d="M${sx},${sy} Q${f((sx + x1) / 2)},${f(sy + 10)} ${lo}" fill="none" stroke="${TEAL_LT}" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="5 6"/>`;
	out += `<path d="M${sx},${sy} Q${f((sx + x1) / 2)},${f(sy - 60)} ${end.x},${end.y}" fill="none" stroke="url(#stroke)" stroke-width="4" stroke-linecap="round"/>`;
	out += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
	for (const [px, py] of pts) out += `<circle cx="${px}" cy="${py}" r="4.5" fill="${NAVY}" stroke="#FFFFFF" stroke-width="2"/>`;
	out += `<circle cx="${end.x}" cy="${end.y}" r="9" fill="${BLUE_LT}"/>`;
	return out;
}

/** Weekly cells as bars under a dashed scheme threshold; one climbing toward it. */
function threshold(r: () => number): string {
	const x0 = 400;
	const base = 520;
	const line = 200;
	const n = 12;
	const bw = 38;
	const step = 60;
	let out = `<line x1="${x0 - 30}" y1="${base}" x2="${x0 + n * step}" y2="${base}" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5"/>`;
	for (let i = 0; i < n; i++) {
		const hot = i === 8;
		const h = hot ? base - line - 34 : 60 + r() * 150;
		const x = x0 + i * step;
		out += `<rect x="${x}" y="${f(base - h)}" width="${bw}" height="${f(h)}" rx="6" fill="${hot ? "url(#fillV)" : "#FFFFFF"}" fill-opacity="${hot ? 1 : 0.1}" stroke="${hot ? BLUE_LT : "#FFFFFF"}" stroke-opacity="${hot ? 0.9 : 0.18}" stroke-width="1.5"/>`;
		if (hot) out += `<circle cx="${x + bw / 2}" cy="${f(base - h)}" r="8" fill="${PURPLE_LT}"/><circle cx="${x + bw / 2}" cy="${f(base - h)}" r="20" fill="none" stroke="${PURPLE_LT}" stroke-opacity="0.45" stroke-width="2"/>`;
	}
	out += `<line x1="${x0 - 30}" y1="${line}" x2="${x0 + n * step}" y2="${line}" stroke="url(#stroke)" stroke-width="3" stroke-dasharray="10 9" stroke-linecap="round"/>`;
	out += `<line x1="${x0 - 30}" y1="${line + 110}" x2="${x0 + n * step}" y2="${line + 110}" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="3 7"/>`;
	return out;
}

const MOTIFS: Record<CoverMotif, (r: () => number) => string> = {
	layers: () => layers(),
	network,
	timeline: () => timeline(),
	fan,
	threshold,
};

/** The cover SVG for a guide, from its motif, its pillar and a seed (its slug). */
export function coverSvg(motif: CoverMotif, pillar: Pillar, seed: string): string {
	const r = rng(seed);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}">${defs()}${backdrop(r, pillar)}${MOTIFS[motif](r)}</svg>`;
}

export const coverPath = (slug: string) => `/covers/${slug}.svg`;
