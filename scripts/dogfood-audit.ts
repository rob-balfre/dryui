/**
 * dogfood-audit.ts
 *
 * Scans Svelte files for raw HTML elements, CSS patterns, and import conflicts
 * that should use DryUI components instead.
 *
 * Usage:  bun run scripts/dogfood-audit.ts
 *         bun run scripts/dogfood-audit.ts --json
 *         bun run scripts/dogfood-audit.ts --summary
 * Exit 0 = all clean, Exit 1 = findings found.
 */

import { Glob } from 'bun';
import { resolve, relative } from 'node:path';

const repoRoot = resolve(import.meta.dir, '..');

// ── Configuration ──────────────────────────────────────────────────────────────

const EXCLUDE_PATTERNS = [
	/node_modules/,
	/\.svelte-kit/,
	/\/dist\//,
	/packages\/ui\/src\//,
	/packages\/primitives\/src\//,
	/packages\/canvas\//,
	/packages\/hand-tracking\//,
	/packages\/studio-server\//,
	/apps\/studio\//
];

/** Raw HTML tag → suggested DryUI component. */
const HTML_TAG_MAP: Record<string, string> = {
	button: 'Button',
	textarea: 'Textarea',
	select: 'Select',
	h1: 'Heading',
	h2: 'Heading',
	h3: 'Heading',
	h4: 'Heading',
	h5: 'Heading',
	h6: 'Heading',
	hr: 'Separator',
	label: 'Label',
	dialog: 'Dialog',
	img: 'Image',
	table: 'Table',
	progress: 'Progress',
	kbd: 'Kbd',
	details: 'Collapsible / Accordion'
};

/** <input type="…"> → specific DryUI component. Unlisted types default to Input. */
const INPUT_TYPE_MAP: Record<string, string> = {
	checkbox: 'Checkbox',
	range: 'Slider',
	number: 'NumberInput',
	time: 'TimeInput',
	date: 'DatePicker',
	color: 'ColorPicker',
	file: 'FileUpload'
};

/** CSS property patterns in <style> blocks → DryUI layout component. */
const CSS_LAYOUT_RULES = [
	{ pattern: /display\s*:\s*flex/g, suggestion: 'Flex or Stack', label: 'display: flex' },
	{ pattern: /display\s*:\s*inline-flex/g, suggestion: 'Flex', label: 'display: inline-flex' },
	{ pattern: /display\s*:\s*grid/g, suggestion: 'Grid', label: 'display: grid' }
];

/** CSS anti-patterns from CLAUDE.md. */
const CSS_ANTIPATTERN_RULES = [
	{ pattern: /!important/g, suggestion: 'Fix specificity at source', label: '!important' },
	{ pattern: /:global\(/g, suggestion: 'Use scoped styles or data-* attrs', label: ':global()' }
];

/** DryUI component name → HTML tags it replaces (for import conflict detection). */
const COMPONENT_TO_TAGS: Record<string, string[]> = {
	Button: ['button'],
	Input: ['input'],
	Textarea: ['textarea'],
	Select: ['select'],
	Heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	Separator: ['hr'],
	Label: ['label'],
	Dialog: ['dialog'],
	Image: ['img'],
	Table: ['table'],
	Progress: ['progress'],
	Kbd: ['kbd'],
	Checkbox: ['input'],
	Slider: ['input'],
	NumberInput: ['input']
};

// ── Types ──────────────────────────────────────────────────────────────────────

type Category = 'html' | 'css' | 'css-antipattern' | 'import-conflict';

interface Finding {
	line: number;
	category: Category;
	element: string;
	suggestion: string;
	context: string;
}

interface FileReport {
	relativePath: string;
	findings: Finding[];
}

// ── Svelte file region parsing ─────────────────────────────────────────────────

interface Region {
	startLine: number;
	endLine: number;
}

interface SvelteRegions {
	scripts: Region[];
	styles: Region[];
	lines: string[];
}

function parseSvelteRegions(source: string): SvelteRegions {
	const lines = source.split('\n');
	const scripts: Region[] = [];
	const styles: Region[] = [];

	let current: { type: 'script' | 'style'; startLine: number } | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (!current) {
			if (/^\s*<script[\s>]/.test(line)) {
				current = { type: 'script', startLine: i };
				// Self-closing or single-line script block
				if (/<\/script>/.test(line)) {
					scripts.push({ startLine: i, endLine: i });
					current = null;
				}
			} else if (/^\s*<style[\s>]/.test(line)) {
				current = { type: 'style', startLine: i };
				if (/<\/style>/.test(line)) {
					styles.push({ startLine: i, endLine: i });
					current = null;
				}
			}
		} else if (current.type === 'script' && /<\/script>/.test(line)) {
			scripts.push({ startLine: current.startLine, endLine: i });
			current = null;
		} else if (current.type === 'style' && /<\/style>/.test(line)) {
			styles.push({ startLine: current.startLine, endLine: i });
			current = null;
		}
	}

	return { scripts, styles, lines };
}

function isInRegion(lineIdx: number, regions: Region[]): boolean {
	return regions.some((r) => lineIdx >= r.startLine && lineIdx <= r.endLine);
}

// ── Scanners ───────────────────────────────────────────────────────────────────

function scanTemplate(regions: SvelteRegions): Finding[] {
	const findings: Finding[] = [];
	const { lines, scripts, styles } = regions;

	let inComment = false;

	for (let i = 0; i < lines.length; i++) {
		if (isInRegion(i, scripts) || isInRegion(i, styles)) continue;

		const line = lines[i];

		// Rough HTML comment tracking (handles most cases)
		if (inComment) {
			if (line.includes('-->')) inComment = false;
			continue;
		}
		if (line.includes('<!--')) {
			if (!line.includes('-->')) inComment = true;
			continue;
		}

		// Check known HTML tags (case-sensitive: <button> is HTML, <Button> is a component)
		for (const [tag, component] of Object.entries(HTML_TAG_MAP)) {
			const regex = new RegExp(`<${tag}(?=[\\s>/$])`, 'g');
			let match: RegExpExecArray | null;
			while ((match = regex.exec(line)) !== null) {
				findings.push({
					line: i + 1,
					category: 'html',
					element: `<${tag}>`,
					suggestion: component,
					context: line.trim().slice(0, 120)
				});
			}
		}

		// Check <input> with type-specific mapping
		const inputRegex = /<input(?=[\s>/$])/g;
		let inputMatch: RegExpExecArray | null;
		while ((inputMatch = inputRegex.exec(line)) !== null) {
			const rest = line.slice(inputMatch.index);
			const typeMatch = rest.match(/type\s*=\s*["'](\w+)["']/);
			const inputType = typeMatch?.[1]?.toLowerCase();
			const component = (inputType && INPUT_TYPE_MAP[inputType]) || 'Input';
			const element = inputType ? `<input type="${inputType}">` : '<input>';

			findings.push({
				line: i + 1,
				category: 'html',
				element,
				suggestion: component,
				context: line.trim().slice(0, 120)
			});
		}
	}

	return findings;
}

function scanStyles(regions: SvelteRegions): Finding[] {
	const findings: Finding[] = [];
	const { lines, styles } = regions;

	for (const region of styles) {
		for (let i = region.startLine; i <= region.endLine; i++) {
			const line = lines[i];

			for (const rule of CSS_LAYOUT_RULES) {
				const regex = new RegExp(rule.pattern.source, 'g');
				let match: RegExpExecArray | null;
				while ((match = regex.exec(line)) !== null) {
					findings.push({
						line: i + 1,
						category: 'css',
						element: rule.label,
						suggestion: rule.suggestion,
						context: line.trim().slice(0, 120)
					});
				}
			}

			for (const rule of CSS_ANTIPATTERN_RULES) {
				const regex = new RegExp(rule.pattern.source, 'g');
				let match: RegExpExecArray | null;
				while ((match = regex.exec(line)) !== null) {
					findings.push({
						line: i + 1,
						category: 'css-antipattern',
						element: rule.label,
						suggestion: rule.suggestion,
						context: line.trim().slice(0, 120)
					});
				}
			}
		}
	}

	return findings;
}

function detectImportConflicts(regions: SvelteRegions, htmlFindings: Finding[]): void {
	const { lines, scripts } = regions;

	// Collect DryUI imports from all script blocks
	const imported = new Set<string>();
	for (const region of scripts) {
		for (let i = region.startLine; i <= region.endLine; i++) {
			const line = lines[i];
			const importMatch = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]@dryui\/ui['"]/);
			if (importMatch) {
				for (const name of importMatch[1].split(',')) {
					imported.add(name.trim());
				}
			}
		}
	}

	if (imported.size === 0) return;

	// Build set of HTML tags that imported components replace
	const coveredTags = new Set<string>();
	for (const comp of imported) {
		const tags = COMPONENT_TO_TAGS[comp];
		if (tags) tags.forEach((t) => coveredTags.add(t));
	}

	// Upgrade matching html findings to import-conflict
	for (const finding of htmlFindings) {
		if (finding.category !== 'html') continue;
		const tag = finding.element.replace(/<|>|\/|\s.*/g, '');
		if (coveredTags.has(tag)) {
			const comp = [...imported].find((c) => COMPONENT_TO_TAGS[c]?.includes(tag));
			finding.category = 'import-conflict';
			finding.suggestion = `${comp} is imported — use it instead of raw <${tag}>`;
		}
	}
}

// ── Output formatting ──────────────────────────────────────────────────────────

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const MAGENTA = '\x1b[35m';

const CATEGORY_STYLE: Record<Category, { color: string; label: string }> = {
	html: { color: YELLOW, label: 'HTML' },
	css: { color: CYAN, label: ' CSS' },
	'css-antipattern': { color: MAGENTA, label: 'ANTI' },
	'import-conflict': { color: RED, label: 'MIXD' }
};

function printReport(reports: FileReport[], filesScanned: number): void {
	console.log();
	console.log(`${BOLD}DryUI Dogfood Audit${RESET}`);
	console.log(`${DIM}Scanning for raw HTML/CSS that should use DryUI components${RESET}`);
	console.log();

	reports.sort((a, b) => b.findings.length - a.findings.length);

	for (const report of reports) {
		console.log(`${BOLD}${report.relativePath}${RESET} ${DIM}(${report.findings.length})${RESET}`);

		for (const f of report.findings) {
			const { color, label } = CATEGORY_STYLE[f.category];
			console.log(
				`  ${color}${label}${RESET} ${DIM}L${String(f.line).padStart(4)}${RESET}  ${f.element} → ${GREEN}${f.suggestion}${RESET}`
			);
			console.log(`         ${DIM}${f.context}${RESET}`);
		}
		console.log();
	}

	// Summary
	const totals: Record<Category, number> = {
		html: 0,
		css: 0,
		'css-antipattern': 0,
		'import-conflict': 0
	};
	let total = 0;
	for (const r of reports) {
		for (const f of r.findings) {
			totals[f.category]++;
			total++;
		}
	}

	console.log(`${BOLD}Summary${RESET}`);
	console.log(`  Files scanned:       ${filesScanned}`);
	console.log(`  Files with findings: ${reports.length}`);
	console.log(`  Total findings:      ${total}`);
	console.log(
		`    ${YELLOW}HTML${RESET} ${totals.html}  ${CYAN}CSS${RESET} ${totals.css}  ${MAGENTA}Anti-pattern${RESET} ${totals['css-antipattern']}  ${RED}Import conflict${RESET} ${totals['import-conflict']}`
	);
	console.log();
}

function printJson(reports: FileReport[], filesScanned: number): void {
	const totals: Record<Category, number> = {
		html: 0,
		css: 0,
		'css-antipattern': 0,
		'import-conflict': 0
	};
	for (const r of reports) {
		for (const f of r.findings) totals[f.category]++;
	}

	console.log(
		JSON.stringify(
			{
				filesScanned,
				filesWithFindings: reports.length,
				totals,
				files: reports.map((r) => ({
					path: r.relativePath,
					findings: r.findings
				}))
			},
			null,
			2
		)
	);
}

function printSummary(reports: FileReport[], filesScanned: number): void {
	const totals: Record<Category, number> = {
		html: 0,
		css: 0,
		'css-antipattern': 0,
		'import-conflict': 0
	};
	let total = 0;
	for (const r of reports) {
		for (const f of r.findings) {
			totals[f.category]++;
			total++;
		}
	}

	console.log(`${BOLD}DryUI Dogfood Audit — Summary${RESET}`);
	console.log(`  Files scanned:       ${filesScanned}`);
	console.log(`  Files with findings: ${reports.length}`);
	console.log(`  Total findings:      ${total}`);
	console.log(
		`    ${YELLOW}HTML${RESET} ${totals.html}  ${CYAN}CSS${RESET} ${totals.css}  ${MAGENTA}Anti-pattern${RESET} ${totals['css-antipattern']}  ${RED}Import conflict${RESET} ${totals['import-conflict']}`
	);
	console.log();
	console.log(`${BOLD}Top files:${RESET}`);
	reports
		.sort((a, b) => b.findings.length - a.findings.length)
		.slice(0, 15)
		.forEach((r) => {
			console.log(`  ${String(r.findings.length).padStart(3)}  ${r.relativePath}`);
		});
	console.log();
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2);
	const jsonMode = args.includes('--json');
	const summaryMode = args.includes('--summary');

	const glob = new Glob('**/*.svelte');
	const reports: FileReport[] = [];
	let filesScanned = 0;

	for await (const filePath of glob.scan(repoRoot)) {
		if (EXCLUDE_PATTERNS.some((p) => p.test(filePath))) continue;

		filesScanned++;

		const fullPath = resolve(repoRoot, filePath);
		const source = await Bun.file(fullPath).text();
		const regions = parseSvelteRegions(source);

		const htmlFindings = scanTemplate(regions);
		const cssFindings = scanStyles(regions);
		detectImportConflicts(regions, htmlFindings);

		const allFindings = [...htmlFindings, ...cssFindings].sort((a, b) => a.line - b.line);

		if (allFindings.length > 0) {
			reports.push({ relativePath: filePath, findings: allFindings });
		}
	}

	if (jsonMode) {
		printJson(reports, filesScanned);
	} else if (summaryMode) {
		printSummary(reports, filesScanned);
	} else {
		printReport(reports, filesScanned);
	}

	const total = reports.reduce((n, r) => n + r.findings.length, 0);
	process.exit(total > 0 ? 1 : 0);
}

main();
