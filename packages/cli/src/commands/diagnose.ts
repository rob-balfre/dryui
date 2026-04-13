// dryui diagnose <file.css> — Validate theme CSS against DryUI spec

import { diagnoseTheme } from '@dryui/mcp/theme-checker';
import type { Spec } from './types.js';
import { severityLabel } from '../format.js';
import { toonDiagnoseResult } from '@dryui/mcp/toon';
import {
	renderCommandResultByMode,
	runFileCommand,
	runStandardCommand,
	type OutputMode
} from '../run.js';

/**
 * Get the diagnose output for a file path.
 * Returns { output, error, exitCode }.
 */
export function getDiagnose(
	filePath: string,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	return runFileCommand(filePath, mode, (css) => {
		const result = diagnoseTheme(css, spec);
		const hasErrors = result.issues.some((i) => i.severity === 'error');

		return renderCommandResultByMode(
			mode,
			result,
			{
				toon: (value) => toonDiagnoseResult(value),
				json: (value) => JSON.stringify(value, null, 2),
				text: (value) => {
					const lines: string[] = [];
					const { variables } = value;
					lines.push(
						`Found ${variables.found} --dry-* variables (${variables.required} required, ${variables.extra} extra)`
					);
					lines.push('');

					if (value.issues.length === 0) {
						lines.push('No issues found.');
						return lines.join('\n');
					}

					for (const issue of value.issues) {
						const label = severityLabel(issue.severity);
						const issueValue = issue.value ? ` (${issue.value})` : '';
						lines.push(`${label} [${issue.code}] ${issue.variable}${issueValue}: ${issue.message}`);
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

export function runDiagnose(args: string[], spec: Spec): void {
	runStandardCommand(args, {
		help: {
			usage: 'dryui diagnose [--json] [--text] <file.css>',
			description: [
				'Validate theme CSS for missing tokens, value errors,',
				'contrast issues, and component token problems.'
			],
			options: [
				'  --text    Plain-text output for humans (default is TOON)',
				'  --json    Output raw JSON instead'
			]
		},
		minPositionals: 1,
		execute: ({ mode, positionals }) => getDiagnose(positionals[0]!, spec, mode)
	});
}
