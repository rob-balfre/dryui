// Shared argument parser for workspace commands (lint, doctor).

import type { WorkspaceSeverity } from '@dryui/mcp/workspace-audit';
import { resolveOutputMode, type OutputMode } from '../run.js';

export interface WorkspaceOptions {
	readonly include?: readonly string[];
	readonly exclude?: readonly string[];
	readonly maxSeverity?: WorkspaceSeverity;
	readonly changed?: boolean;
	readonly full?: boolean;
}

/**
 * Parse shared workspace flags: --include, --exclude, --changed, --max-severity, --full.
 * Output mode is resolved via resolveOutputMode — TOON is the default, `--text`
 * opts into plain text, `--json` into JSON (only when `allowJson` is true;
 * doctor passes `false` since it doesn't produce JSON).
 */
export function parseWorkspaceArgs(
	args: string[],
	{ allowJson = true }: { allowJson?: boolean } = {}
): {
	path: string | undefined;
	mode: OutputMode;
	options: WorkspaceOptions;
} {
	const include: string[] = [];
	const exclude: string[] = [];
	let path: string | undefined;
	let full = false;
	let changed = false;
	let maxSeverity: WorkspaceSeverity = 'info';

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (!arg) continue;

		if (arg === '--full') {
			full = true;
			continue;
		}

		if (arg === '--changed') {
			changed = true;
			continue;
		}

		if (arg === '--include' || arg.startsWith('--include=')) {
			const value = arg.includes('=') ? arg.slice('--include='.length) : args[++index];
			if (value && !value.startsWith('--')) include.push(value);
			continue;
		}

		if (arg === '--exclude' || arg.startsWith('--exclude=')) {
			const value = arg.includes('=') ? arg.slice('--exclude='.length) : args[++index];
			if (value && !value.startsWith('--')) exclude.push(value);
			continue;
		}

		if (arg === '--max-severity' || arg.startsWith('--max-severity=')) {
			const value = arg.includes('=') ? arg.slice('--max-severity='.length) : args[++index];
			if (value === 'error' || value === 'warning' || value === 'info') {
				maxSeverity = value;
			}
			continue;
		}

		if (arg.startsWith('--')) continue;
		if (!path) path = arg;
	}

	const { mode } = resolveOutputMode(args, allowJson);
	return { path, mode, options: { full, include, exclude, maxSeverity, changed } };
}
