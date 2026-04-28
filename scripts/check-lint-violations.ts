/**
 * Runs @dryui/lint rules against all .svelte files in the library packages.
 * This catches violations that only surface during Vite preprocessing, making
 * them part of the CI check pipeline.
 *
 * packages/ui/src — full rule set
 * packages/primitives/src — dryui/no-svelte-element only. Primitives are
 *   headless and legitimately use raw <button>/<input>/etc.; other rules
 *   (flex, width) have pre-existing tolerated violations there.
 */
import { Glob } from 'bun';
import {
	checkScript,
	checkMarkup,
	checkStyle,
	type Violation
} from '../packages/lint/src/rules.js';

const FULL_SCAN_DIR = 'packages/ui/src';
const PRIMITIVES_SCAN_DIR = 'packages/primitives/src';

const PRIMITIVES_ALLOWED_RULES = new Set(['dryui/no-svelte-element']);

const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;

let totalViolations = 0;
const glob = new Glob('**/*.svelte');

async function lintDir(scanDir: string, ruleAllowlist: Set<string> | null) {
	const paths: string[] = [];
	for await (const path of glob.scan(scanDir)) {
		paths.push(path);
	}

	for (const path of paths.sort((left, right) => left.localeCompare(right))) {
		const filePath = `${scanDir}/${path}`;
		const content = await Bun.file(filePath).text();

		const violations: Violation[] = [];

		for (const match of content.matchAll(scriptRe)) {
			violations.push(...checkScript(match[1]));
		}

		violations.push(...checkMarkup(content, filePath));

		for (const match of content.matchAll(styleRe)) {
			violations.push(...checkStyle(match[1], {}, filePath));
		}

		const filtered = ruleAllowlist
			? violations.filter((v) => ruleAllowlist.has(v.rule))
			: violations;

		if (filtered.length > 0) {
			for (const v of filtered) {
				console.error(`[${v.rule}] ${filePath}:${v.line} — ${v.message}`);
			}
			totalViolations += filtered.length;
		}
	}
}

await lintDir(FULL_SCAN_DIR, null);
await lintDir(PRIMITIVES_SCAN_DIR, PRIMITIVES_ALLOWED_RULES);

if (totalViolations > 0) {
	console.error(`\n${totalViolations} lint violation(s) found.`);
	process.exit(1);
} else {
	console.log('No lint violations found.');
}
