/**
 * Runs @dryui/lint rules against first-party Svelte/CSS surfaces.
 * This catches violations that only surface during Vite preprocessing, making
 * them part of the CI check pipeline.
 *
 * packages/ui/src — full rule set, minus dryui/no-raw-element and dryui/no-raw-grid
 *   which consumer-only enforcement; component implementations legitimately use
 *   raw HTML and CSS grid internally.
 * packages/feedback-server/ui/src — same exemptions as packages/ui/src.
 * packages/primitives/src — dryui/no-svelte-element only. Primitives are
 *   headless and legitimately use raw <button>/<input>/etc.; other rules
 *   (flex, width) have pre-existing tolerated violations there.
 */
import { Glob } from 'bun';
import { checkStyle, checkSvelteFile, type Violation } from '../packages/lint/src/rules.js';
import { RULE_CATALOG } from '../packages/lint/src/rule-catalog.js';

const FULL_SCAN_DIRS = ['packages/ui/src', 'packages/feedback-server/ui/src'];
const PRIMITIVES_SCAN_DIR = 'packages/primitives/src';

const FIRST_PARTY_IGNORED_RULES = new Set(['dryui/no-raw-element', 'dryui/no-raw-grid']);
const PRIMITIVES_ALLOWED_RULES = new Set(['dryui/no-svelte-element']);

let totalErrors = 0;
const svelteGlob = new Glob('**/*.svelte');
const cssGlob = new Glob('**/*.css');

function severityOf(rule: string): 'error' | 'warning' | 'suggestion' | 'info' {
	return RULE_CATALOG[rule]?.severity ?? 'error';
}

function reportViolation(filePath: string, violation: Violation): void {
	const severity = severityOf(violation.rule);
	console.error(
		`[${severity}] [${violation.rule}] ${filePath}:${violation.line} — ${violation.message}`
	);
	if (severity === 'error') totalErrors += 1;
}

async function lintDir(scanDir: string, ruleAllowlist: Set<string> | null) {
	const sveltePaths: string[] = [];
	for await (const path of svelteGlob.scan(scanDir)) {
		sveltePaths.push(path);
	}

	for (const path of sveltePaths.sort((left, right) => left.localeCompare(right))) {
		const filePath = `${scanDir}/${path}`;
		const content = await Bun.file(filePath).text();
		const violations = checkSvelteFile(content, filePath);

		const filtered = ruleAllowlist
			? violations.filter((v) => ruleAllowlist.has(v.rule))
			: violations.filter((v) => !FIRST_PARTY_IGNORED_RULES.has(v.rule));

		if (filtered.length > 0) {
			for (const v of filtered) {
				reportViolation(filePath, v);
			}
		}
	}

	if (ruleAllowlist) return;

	const cssPaths: string[] = [];
	for await (const path of cssGlob.scan(scanDir)) {
		cssPaths.push(path);
	}

	for (const path of cssPaths.sort((left, right) => left.localeCompare(right))) {
		const filePath = `${scanDir}/${path}`;
		const content = await Bun.file(filePath).text();
		const violations = checkStyle(content, {}, filePath).filter(
			(v) => !FIRST_PARTY_IGNORED_RULES.has(v.rule)
		);

		if (violations.length > 0) {
			for (const v of violations) {
				reportViolation(filePath, v);
			}
		}
	}
}

for (const scanDir of FULL_SCAN_DIRS) {
	await lintDir(scanDir, null);
}
await lintDir(PRIMITIVES_SCAN_DIR, PRIMITIVES_ALLOWED_RULES);

if (totalErrors > 0) {
	console.error(`\n${totalErrors} lint error(s) found.`);
	process.exit(1);
} else {
	console.log('No lint violations found.');
}
