/**
 * Runs @dryui/lint rules against all .svelte files in packages/ui/src/.
 * This catches violations that only surface during Vite preprocessing,
 * making them part of the CI check pipeline.
 */
import { Glob } from 'bun';
import {
	checkScript,
	checkMarkup,
	checkStyle,
	type Violation
} from '../packages/lint/src/rules.js';

const SCAN_DIR = 'packages/ui/src';

const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;

let totalViolations = 0;
const glob = new Glob('**/*.svelte');

const SKIP_PATHS: string[] = [];

for await (const path of glob.scan(SCAN_DIR)) {
	if (SKIP_PATHS.some((p) => path.startsWith(p))) continue;
	const filePath = `${SCAN_DIR}/${path}`;
	const content = await Bun.file(filePath).text();

	const violations: Violation[] = [];

	// Check script blocks
	for (const match of content.matchAll(scriptRe)) {
		violations.push(...checkScript(match[1]));
	}

	// Check markup (the function strips script/style internally)
	violations.push(...checkMarkup(content));

	// Check style blocks
	for (const match of content.matchAll(styleRe)) {
		violations.push(...checkStyle(match[1]));
	}

	if (violations.length > 0) {
		for (const v of violations) {
			console.error(`[${v.rule}] ${filePath}:${v.line} — ${v.message}`);
		}
		totalViolations += violations.length;
	}
}

if (totalViolations > 0) {
	console.error(`\n${totalViolations} lint violation(s) found.`);
	process.exit(1);
} else {
	console.log('No lint violations found.');
}
