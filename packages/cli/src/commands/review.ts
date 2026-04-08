// dryui review <file.svelte> — Validate a Svelte file against DryUI spec

import { readFileSync } from 'node:fs';
import { reviewComponent } from '../../../mcp/src/reviewer.js';
import type { Spec } from './types.js';
import { severityLabel } from '../format.js';
import { toonReviewResult } from '@dryui/mcp/toon';
import { runCommand, fileNotFound, type OutputMode } from '../run.js';

/**
 * Get the review output for a file path.
 * Returns { output, error, exitCode }.
 */
export function getReview(
	filePath: string,
	spec: Spec,
	options?: { json?: boolean; toon?: boolean }
): { output: string; error: string | null; exitCode: number } {
	const missing = fileNotFound(filePath, options?.toon);
	if (missing) return missing;

	const code = readFileSync(filePath, 'utf-8');
	const filename = filePath.split('/').pop();
	const result = reviewComponent(code, spec, filename);

	if (options?.toon) {
		return {
			output: toonReviewResult(result),
			error: null,
			exitCode: result.issues.some((i) => i.severity === 'error') ? 1 : 0
		};
	}

	if (options?.json) {
		return {
			output: JSON.stringify(result, null, 2),
			error: null,
			exitCode: result.issues.some((i) => i.severity === 'error') ? 1 : 0
		};
	}

	if (result.issues.length === 0) {
		return { output: 'No issues found.', error: null, exitCode: 0 };
	}

	const lines: string[] = [];
	for (const issue of result.issues) {
		const label = severityLabel(issue.severity);
		lines.push(`${label} line ${issue.line}: ${issue.message}`);
		if (issue.fix) {
			lines.push(`      Fix: ${issue.fix}`);
		}
	}
	lines.push('');
	lines.push(result.summary);

	const hasErrors = result.issues.some((i) => i.severity === 'error');
	return { output: lines.join('\n'), error: null, exitCode: hasErrors ? 1 : 0 };
}

export function runReview(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui review [--json] [--toon] <file.svelte>');
		console.log('');
		console.log('Validate a Svelte component against the DryUI spec.');
		console.log('Checks for incorrect component usage, missing props,');
		console.log('accessibility issues, and style suggestions.');
		console.log('');
		console.log('Options:');
		console.log('  --json    Output raw JSON instead of formatted text');
		console.log('  --toon    Output in TOON format (token-optimized for agents)');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const jsonMode = args.includes('--json');
	const toon = args.includes('--toon');
	const fileArgs = args.filter((a) => !a.startsWith('--'));
	const filePath = fileArgs[0];
	if (!filePath) {
		console.error('Error: missing file path');
		process.exit(1);
	}

	const mode: OutputMode = toon ? 'toon' : jsonMode ? 'json' : 'text';
	runCommand(getReview(filePath, spec, { json: jsonMode, toon }), mode);
}
