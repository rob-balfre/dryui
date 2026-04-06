// Shared argument parser for workspace commands (lint, doctor).

import type { WorkspaceSeverity } from '../../../mcp/src/workspace-audit.js';

export interface WorkspaceOptions {
	readonly include?: readonly string[];
	readonly exclude?: readonly string[];
	readonly maxSeverity?: WorkspaceSeverity;
	readonly changed?: boolean;
	readonly json?: boolean;
}

/**
 * Parse shared workspace flags: --include, --exclude, --changed, --max-severity, --json.
 * Returns the first positional argument as `path` and all parsed options.
 */
export function parseWorkspaceArgs(args: string[]): {
	path: string | undefined;
	options: WorkspaceOptions;
} {
	const include: string[] = [];
	const exclude: string[] = [];
	let path: string | undefined;
	let json = false;
	let changed = false;
	let maxSeverity: WorkspaceSeverity = 'info';

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (!arg) continue;

		if (arg === '--json') {
			json = true;
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

	return { path, options: { json, include, exclude, maxSeverity, changed } };
}
