// dryui diagnose <file.css> — Validate theme CSS against DryUI spec

import { readFileSync } from 'node:fs';
import { diagnoseTheme } from '../../../mcp/src/theme-checker.js';
import type { Spec } from './types.js';
import { severityLabel } from '../format.js';
import { toonDiagnoseResult } from '@dryui/mcp/toon';
import { runCommand, fileNotFound, type OutputMode } from '../run.js';

/**
 * Get the diagnose output for a file path.
 * Returns { output, error, exitCode }.
 */
export function getDiagnose(
	filePath: string,
	spec: Spec,
	options?: { json?: boolean; toon?: boolean }
): { output: string; error: string | null; exitCode: number } {
	const missing = fileNotFound(filePath, options?.toon);
	if (missing) return missing;

	const css = readFileSync(filePath, 'utf-8');
	const result = diagnoseTheme(css, spec);

	if (options?.toon) {
		return {
			output: toonDiagnoseResult(result),
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

	const lines: string[] = [];
	const { variables } = result;
	lines.push(
		`Found ${variables.found} --dry-* variables (${variables.required} required, ${variables.extra} extra)`
	);
	lines.push('');

	if (result.issues.length === 0) {
		lines.push('No issues found.');
		return { output: lines.join('\n'), error: null, exitCode: 0 };
	}

	for (const issue of result.issues) {
		const label = severityLabel(issue.severity);
		const value = issue.value ? ` (${issue.value})` : '';
		lines.push(`${label} [${issue.code}] ${issue.variable}${value}: ${issue.message}`);
		if (issue.fix) {
			lines.push(`      Fix: ${issue.fix}`);
		}
	}

	lines.push('');
	lines.push(result.summary);

	const hasErrors = result.issues.some((i) => i.severity === 'error');
	return { output: lines.join('\n'), error: null, exitCode: hasErrors ? 1 : 0 };
}

export function runDiagnose(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui diagnose [--json] [--toon] <file.css>');
		console.log('');
		console.log('Validate theme CSS for missing tokens, value errors,');
		console.log('contrast issues, and component token problems.');
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
	runCommand(getDiagnose(filePath, spec, { json: jsonMode, toon }), mode);
}
