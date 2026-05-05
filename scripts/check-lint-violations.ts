/**
 * Runs @dryui/lint rules against first-party Svelte/CSS surfaces.
 * This catches violations that only surface during Vite preprocessing, making
 * them part of the CI check pipeline.
 *
 * First-party scan targets and filtering policy live in
 * packages/lint/src/lint-policy.ts so this script only handles file discovery
 * and reporting.
 */
import { Glob } from 'bun';
import { checkStyle, checkSvelteFile, type Violation } from '../packages/lint/src/rules.js';
import {
	FIRST_PARTY_LINT_SCAN_TARGETS,
	filterFirstPartyViolations,
	lintRuleSeverity,
	type FirstPartyLintTarget
} from '../packages/lint/src/lint-policy.js';

let totalErrors = 0;
const svelteGlob = new Glob('**/*.svelte');
const cssGlob = new Glob('**/*.css');

function reportViolation(filePath: string, violation: Violation): void {
	const severity = lintRuleSeverity(violation.rule);
	console.error(
		`[${severity}] [${violation.rule}] ${filePath}:${violation.line} — ${violation.message}`
	);
	if (severity === 'error') totalErrors += 1;
}

async function lintDir(scanDir: string, target: FirstPartyLintTarget, includeCss: boolean) {
	const sveltePaths: string[] = [];
	for await (const path of svelteGlob.scan(scanDir)) {
		sveltePaths.push(path);
	}

	for (const path of sveltePaths.sort((left, right) => left.localeCompare(right))) {
		const filePath = `${scanDir}/${path}`;
		const content = await Bun.file(filePath).text();
		const violations = checkSvelteFile(content, filePath);

		const filtered = filterFirstPartyViolations(target, violations);

		if (filtered.length > 0) {
			for (const v of filtered) {
				reportViolation(filePath, v);
			}
		}
	}

	if (!includeCss) return;

	const cssPaths: string[] = [];
	for await (const path of cssGlob.scan(scanDir)) {
		cssPaths.push(path);
	}

	for (const path of cssPaths.sort((left, right) => left.localeCompare(right))) {
		const filePath = `${scanDir}/${path}`;
		const content = await Bun.file(filePath).text();
		const violations = filterFirstPartyViolations(target, checkStyle(content, {}, filePath));

		if (violations.length > 0) {
			for (const v of violations) {
				reportViolation(filePath, v);
			}
		}
	}
}

for (const scanTarget of FIRST_PARTY_LINT_SCAN_TARGETS) {
	await lintDir(scanTarget.directory, scanTarget.target, scanTarget.includeCss);
}

if (totalErrors > 0) {
	console.error(`\n${totalErrors} lint error(s) found.`);
	process.exit(1);
} else {
	console.log('No lint violations found.');
}
