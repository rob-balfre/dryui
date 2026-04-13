// dryui review <file.svelte> — Validate a Svelte file against DryUI spec

import { reviewComponent } from '@dryui/mcp/reviewer';
import type { Spec } from './types.js';
import { severityLabel } from '../format.js';
import { toonReviewResult } from '@dryui/mcp/toon';
import {
	renderCommandResultByMode,
	runFileCommand,
	runStandardCommand,
	type OutputMode
} from '../run.js';

/**
 * Get the review output for a file path.
 * Returns { output, error, exitCode }.
 */
export function getReview(
	filePath: string,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	return runFileCommand(filePath, mode, (code) => {
		const filename = filePath.split('/').pop();
		const result = reviewComponent(code, spec, filename);
		const hasErrors = result.issues.some((i) => i.severity === 'error');

		return renderCommandResultByMode(
			mode,
			result,
			{
				toon: (value) => toonReviewResult(value),
				json: (value) => JSON.stringify(value, null, 2),
				text: (value) => {
					if (value.issues.length === 0) {
						return 'No issues found.';
					}

					const lines: string[] = [];
					for (const issue of value.issues) {
						const label = severityLabel(issue.severity);
						lines.push(`${label} line ${issue.line}: ${issue.message}`);
						if (issue.fix) {
							lines.push(`      Fix: ${issue.fix}`);
						}
					}
					lines.push('');
					lines.push(value.summary);

					return lines.join('\n');
				}
			},
			hasErrors ? 1 : 0
		);
	});
}

export function runReview(args: string[], spec: Spec): void {
	runStandardCommand(args, {
		help: {
			usage: 'dryui review [--json] [--text] <file.svelte>',
			description: [
				'Validate a Svelte component against the DryUI spec.',
				'Checks for incorrect component usage, missing props,',
				'accessibility issues, and style suggestions.'
			],
			options: [
				'  --text    Plain-text output for humans (default is TOON)',
				'  --json    Output raw JSON instead'
			]
		},
		minPositionals: 1,
		execute: ({ mode, positionals }) => getReview(positionals[0]!, spec, mode)
	});
}
