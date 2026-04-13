// dryui review <file.svelte> — Validate a Svelte file against DryUI spec

import { readFileSync } from 'node:fs';
import { reviewComponent } from '@dryui/mcp/reviewer';
import type { Spec } from './types.js';
import { severityLabel } from '../format.js';
import { toonReviewResult } from '@dryui/mcp/toon';
import { fileNotFound, resolveOutputMode, runCommand, type OutputMode } from '../run.js';

/**
 * Get the review output for a file path.
 * Returns { output, error, exitCode }.
 */
export function getReview(
	filePath: string,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	const missing = fileNotFound(filePath, mode);
	if (missing) return missing;

	const code = readFileSync(filePath, 'utf-8');
	const filename = filePath.split('/').pop();
	const result = reviewComponent(code, spec, filename);
	const hasErrors = result.issues.some((i) => i.severity === 'error');

	switch (mode) {
		case 'toon':
			return {
				output: toonReviewResult(result),
				error: null,
				exitCode: hasErrors ? 1 : 0
			};
		case 'json':
			return {
				output: JSON.stringify(result, null, 2),
				error: null,
				exitCode: hasErrors ? 1 : 0
			};
		default: {
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

			return { output: lines.join('\n'), error: null, exitCode: hasErrors ? 1 : 0 };
		}
	}
}

export function runReview(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui review [--json] [--text] <file.svelte>');
		console.log('');
		console.log('Validate a Svelte component against the DryUI spec.');
		console.log('Checks for incorrect component usage, missing props,');
		console.log('accessibility issues, and style suggestions.');
		console.log('');
		console.log('Options:');
		console.log('  --text    Plain-text output for humans (default is TOON)');
		console.log('  --json    Output raw JSON instead');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const { mode } = resolveOutputMode(args);
	const fileArgs = args.filter((a) => !a.startsWith('--'));
	const filePath = fileArgs[0];
	if (!filePath) {
		console.error('Error: missing file path');
		process.exit(1);
	}

	runCommand(getReview(filePath, spec, mode), mode);
}
