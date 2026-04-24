import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { displayPath } from './utils.js';

export const DESIGN_BRIEF_FILENAME = 'DESIGN.md';

export type DesignBriefIssueCode =
	| 'missing-frontmatter'
	| 'missing-name'
	| 'missing-overview'
	| 'missing-colors'
	| 'missing-typography'
	| 'missing-do-donts'
	| 'too-vague';

export type DesignBriefSeverity = 'warning' | 'suggestion' | 'info';

export interface DesignBriefIssue {
	readonly code: DesignBriefIssueCode;
	readonly severity: DesignBriefSeverity;
	readonly message: string;
	readonly line: number | null;
	readonly suggestedFix: string | null;
}

export interface DesignBrief {
	readonly path: string;
	readonly displayPath: string;
	readonly content: string;
	readonly frontmatter: Readonly<Record<string, string>>;
	readonly hasFrontmatter: boolean;
	readonly name: string | null;
	readonly overview: string | null;
	readonly colors: string | null;
	readonly typography: string | null;
	readonly doDonts: string | null;
	readonly issues: readonly DesignBriefIssue[];
	readonly summary: string;
	readonly promptContext: string;
}

export class DesignBriefNotFoundError extends Error {
	readonly code = 'not-found';
	readonly suggestions: readonly string[];

	constructor(inputPath: string, absPath: string) {
		super(`Design brief not found: ${absPath}`);
		this.name = 'DesignBriefNotFoundError';
		this.suggestions = [
			`Check the --design path: ${inputPath}`,
			'Pass an existing DESIGN.md file or omit --design to auto-discover the nearest brief.'
		];
	}
}

interface Section {
	readonly title: string;
	readonly body: string;
	readonly line: number;
}

interface FrontmatterParse {
	readonly hasFrontmatter: boolean;
	readonly data: Record<string, string>;
	readonly body: string;
}

const FIELD_LIMIT = 260;

function compact(value: string | null | undefined, max = FIELD_LIMIT): string | null {
	if (!value) return null;
	const cleaned = value.replace(/\s+/g, ' ').trim();
	if (!cleaned) return null;
	if (cleaned.length <= max) return cleaned;
	return `${cleaned.slice(0, max - 3).trim()}...`;
}

function stripQuotes(value: string): string {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1).trim();
	}
	return trimmed;
}

function sentenceFragment(value: string): string {
	const first = value[0];
	if (!first || first !== first.toUpperCase() || first === first.toLowerCase()) return value;
	const next = value[1];
	if (next && next === next.toUpperCase() && next !== next.toLowerCase()) return value;
	return `${first.toLowerCase()}${value.slice(1)}`;
}

function parseFrontmatter(content: string): FrontmatterParse {
	if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
		return { hasFrontmatter: false, data: {}, body: content };
	}

	const lines = content.split(/\r?\n/);
	let closeIndex = -1;
	for (let index = 1; index < lines.length; index += 1) {
		if (lines[index]?.trim() === '---') {
			closeIndex = index;
			break;
		}
	}
	if (closeIndex === -1) return { hasFrontmatter: false, data: {}, body: content };

	const data: Record<string, string> = {};
	for (const line of lines.slice(1, closeIndex)) {
		const match = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
		if (!match || match[1] === undefined || match[2] === undefined) continue;
		data[match[1].toLowerCase()] = stripQuotes(match[2]);
	}

	return {
		hasFrontmatter: true,
		data,
		body: lines.slice(closeIndex + 1).join('\n')
	};
}

function parseSections(markdown: string): readonly Section[] {
	const lines = markdown.split(/\r?\n/);
	const sections: Section[] = [];
	let current: { title: string; line: number; body: string[] } | null = null;

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? '';
		const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
		if (match && match[2] !== undefined) {
			if (current) {
				sections.push({
					title: current.title,
					line: current.line,
					body: current.body.join('\n').trim()
				});
			}
			current = { title: match[2].trim(), line: index + 1, body: [] };
			continue;
		}
		if (current) current.body.push(line);
	}

	if (current) {
		sections.push({
			title: current.title,
			line: current.line,
			body: current.body.join('\n').trim()
		});
	}

	return sections;
}

function findSection(sections: readonly Section[], patterns: readonly RegExp[]): Section | null {
	for (const section of sections) {
		if (patterns.some((pattern) => pattern.test(section.title))) return section;
	}
	return null;
}

function firstHeading(sections: readonly Section[]): string | null {
	const title = sections[0]?.title;
	return compact(title ?? null, 120);
}

function fieldFrom(
	frontmatter: Readonly<Record<string, string>>,
	keys: readonly string[],
	section: Section | null
): string | null {
	for (const key of keys) {
		const value = compact(frontmatter[key]);
		if (value) return value;
	}
	return compact(section?.body);
}

function vague(value: string): boolean {
	const normalized = value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!normalized) return false;
	const exact = new Set([
		'app',
		'website',
		'product',
		'ui',
		'interface',
		'modern app',
		'modern website',
		'clean app',
		'clean interface',
		'nice ui',
		'beautiful dashboard'
	]);
	if (exact.has(normalized)) return true;
	const words = normalized.split(' ');
	const vagueWords = new Set([
		'beautiful',
		'clean',
		'easy',
		'friendly',
		'great',
		'intuitive',
		'modern',
		'nice',
		'polished',
		'premium',
		'simple',
		'sleek'
	]);
	return words.length <= 4 && words.every((word) => vagueWords.has(word));
}

function designIssues(args: {
	hasFrontmatter: boolean;
	name: string | null;
	overview: string | null;
	colors: string | null;
	typography: string | null;
	doDonts: string | null;
}): readonly DesignBriefIssue[] {
	const issues: DesignBriefIssue[] = [];
	if (!args.hasFrontmatter) {
		issues.push({
			code: 'missing-frontmatter',
			severity: 'warning',
			line: 1,
			message: 'DESIGN.md should start with YAML frontmatter so tools can read its identity.',
			suggestedFix: 'Add frontmatter with at least name and overview fields.'
		});
	}
	if (!args.name) {
		issues.push({
			code: 'missing-name',
			severity: 'warning',
			line: null,
			message: 'Design brief is missing a product or interface name.',
			suggestedFix: 'Add `name:` to frontmatter or an H1 with the interface name.'
		});
	}
	if (!args.overview) {
		issues.push({
			code: 'missing-overview',
			severity: 'warning',
			line: null,
			message: 'Design brief is missing a concise overview of the interface.',
			suggestedFix: 'Add `overview:` or an Overview section with the target user and job.'
		});
	}
	if (!args.colors) {
		issues.push({
			code: 'missing-colors',
			severity: 'suggestion',
			line: null,
			message: 'Design brief does not describe the color direction.',
			suggestedFix: 'Add a Colors section with palette intent, contrast, and surfaces.'
		});
	}
	if (!args.typography) {
		issues.push({
			code: 'missing-typography',
			severity: 'suggestion',
			line: null,
			message: 'Design brief does not describe typography direction.',
			suggestedFix: 'Add a Typography section with hierarchy, density, and tone guidance.'
		});
	}
	if (!args.doDonts) {
		issues.push({
			code: 'missing-do-donts',
			severity: 'suggestion',
			line: null,
			message: "Design brief does not include do/don't guardrails.",
			suggestedFix: "Add Do and Don't bullets for decisions the reviewer should enforce."
		});
	}
	if ((args.name && vague(args.name)) || (args.overview && vague(args.overview))) {
		issues.push({
			code: 'too-vague',
			severity: 'suggestion',
			line: null,
			message: 'Design identity is too vague to guide visual review.',
			suggestedFix: 'Name the domain, user, tone, and one or two concrete interface priorities.'
		});
	}
	return issues;
}

function promptContext(brief: {
	path: string;
	name: string | null;
	overview: string | null;
	colors: string | null;
	typography: string | null;
	doDonts: string | null;
}): string {
	const identitySuffix = brief.overview ? ` - ${sentenceFragment(brief.overview)}` : '';
	const lines = [
		`Design brief: ${brief.path}`,
		`Identity: ${brief.name ?? 'unspecified'}${identitySuffix}`
	];
	if (brief.colors) lines.push(`Colors: ${brief.colors}`);
	if (brief.typography) lines.push(`Typography: ${brief.typography}`);
	if (brief.doDonts) lines.push(`Do/Don't: ${brief.doDonts}`);
	lines.push(
		'Make-interfaces-feel-better rubric: judge visible hierarchy, rhythm, density, affordance clarity, alignment, copy scannability, and whether the rendered UI matches the brief. Prefer concrete polish defects over subjective redesign wishes.'
	);
	return lines.join('\n');
}

export function analyzeDesignBrief(absPath: string, cwd = process.cwd()): DesignBrief {
	const content = readFileSync(absPath, 'utf-8');
	const parsed = parseFrontmatter(content);
	const sections = parseSections(parsed.body);
	const overviewSection = findSection(sections, [/^overview$/i, /^summary$/i, /^intent$/i]);
	const colorsSection = findSection(sections, [/^colou?rs?$/i, /^palette$/i, /^visual colour$/i]);
	const typographySection = findSection(sections, [/^typography$/i, /^type$/i, /^hierarchy$/i]);
	const doDontsSection = findSection(sections, [
		/^do\s*\/\s*don'?ts?$/i,
		/^dos?\s+and\s+don'?ts?$/i,
		/^guardrails$/i,
		/^principles$/i
	]);
	const doSection = findSection(sections, [/^dos?$/i]);
	const dontSection = findSection(sections, [/^don'?ts?$/i]);

	const name = fieldFrom(parsed.data, ['name', 'product', 'title'], null) ?? firstHeading(sections);
	const overview = fieldFrom(parsed.data, ['overview', 'summary', 'intent'], overviewSection);
	const colors = fieldFrom(parsed.data, ['colors', 'colours', 'palette'], colorsSection);
	const typography = fieldFrom(parsed.data, ['typography', 'type'], typographySection);
	const doDonts =
		fieldFrom(parsed.data, ['do-donts', 'do_donts', 'dodonts', 'guardrails'], doDontsSection) ??
		compact([doSection?.body, dontSection?.body].filter(Boolean).join('\n'));

	const issues = designIssues({
		hasFrontmatter: parsed.hasFrontmatter,
		name,
		overview,
		colors,
		typography,
		doDonts
	});
	const summary =
		issues.length === 0
			? 'design brief has the core identity, visual direction, and guardrails'
			: `${issues.length} design brief issue${issues.length === 1 ? '' : 's'}`;
	const path = displayPath(absPath, cwd);

	return {
		path: absPath,
		displayPath: path,
		content,
		frontmatter: parsed.data,
		hasFrontmatter: parsed.hasFrontmatter,
		name,
		overview,
		colors,
		typography,
		doDonts,
		issues,
		summary,
		promptContext: promptContext({ path: absPath, name, overview, colors, typography, doDonts })
	};
}

export function findNearestDesignBrief(start = process.cwd(), stopAt?: string): string | null {
	let current = resolve(start);
	try {
		if (existsSync(current) && !statSync(current).isDirectory()) current = dirname(current);
	} catch {
		return null;
	}

	const boundary = stopAt ? resolve(stopAt) : null;
	const boundaryPrefix = boundary
		? boundary.endsWith(sep)
			? boundary
			: `${boundary}${sep}`
		: null;

	while (true) {
		if (boundary && current !== boundary && !current.startsWith(boundaryPrefix ?? '')) return null;
		const candidate = resolve(current, DESIGN_BRIEF_FILENAME);
		try {
			if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
		} catch {
			return null;
		}
		if (boundary && current === boundary) return null;
		const parent = dirname(current);
		if (parent === current) {
			return null;
		}
		current = parent;
	}
}

export function resolveDesignBriefPath(
	inputPath: string | undefined,
	cwd = process.cwd()
): string | null {
	if (inputPath) {
		const candidate = resolve(cwd, inputPath);
		try {
			if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
		} catch {
			// Fall through to the explicit-path error below.
		}
		throw new DesignBriefNotFoundError(inputPath, candidate);
	}
	return findNearestDesignBrief(cwd);
}

export function loadDesignBrief(
	inputPath: string | undefined,
	cwd = process.cwd()
): DesignBrief | null {
	const absPath = resolveDesignBriefPath(inputPath, cwd);
	if (!absPath) return null;
	return analyzeDesignBrief(absPath, cwd);
}
