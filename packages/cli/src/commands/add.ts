// dryui add <component> — Print a copyable component starter

import { findComponent } from './info.js';
import type { Spec } from './types.js';
import { buildAddSnippet, formatAddPlan } from './project-planner.js';
import { planAdd } from '@dryui/mcp/project-planner';
import { toonAddPlan } from '@dryui/mcp/toon';
import {
	commandError,
	renderCommandResultByMode,
	resolveOutputMode,
	runCommand,
	type CommandResult,
	type OutputMode
} from '../run.js';

interface AddOptions {
	subpath?: boolean;
	withTheme?: boolean;
	project?: boolean;
	target?: string;
	cwd?: string;
}

function parseProjectInput(
	positionals: string[],
	spec: Spec
): { cwd?: string; query?: string; error?: string } {
	const first = positionals[0];
	const second = positionals[1];

	if (!first) {
		return {};
	}

	if (!second) {
		return { query: first };
	}

	if (positionals.length === 2) {
		const firstIsQuery = Boolean(findComponent(spec, first));
		const secondIsQuery = Boolean(findComponent(spec, second));

		if (firstIsQuery && !secondIsQuery) {
			return { query: first, cwd: second };
		}

		return { cwd: first, query: second };
	}

	return { error: 'Error: add --project accepts at most a project path and a component name' };
}

export function getAdd(
	query: string,
	spec: Spec,
	mode: OutputMode,
	options: AddOptions = {}
): CommandResult {
	if (options.target && !options.project) {
		return commandError(mode, 'invalid-flag', '--target requires --project');
	}

	if (options.project) {
		try {
			const planOptions = {
				cwd: options.cwd ?? process.cwd(),
				...(options.subpath !== undefined ? { subpath: options.subpath } : {}),
				...(options.target !== undefined ? { target: options.target } : {})
			};
			const plan = planAdd(spec, query, planOptions);

			return renderCommandResultByMode(mode, plan, {
				toon: (value) => toonAddPlan(value),
				json: (value) => JSON.stringify(value, null, 2),
				text: (value) => formatAddPlan(value)
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			const code = /unknown component/i.test(message) ? 'not-found' : 'plan-failed';
			const suggestions = code === 'not-found' ? Object.keys(spec.components).sort() : undefined;
			return commandError(mode, code, message, suggestions);
		}
	}

	const snippet = buildAddSnippet(query, spec, {
		...(options.subpath !== undefined ? { subpath: options.subpath } : {}),
		...(options.withTheme !== undefined ? { withTheme: options.withTheme } : {})
	});

	// Snippet mode is always text output. If the component lookup failed,
	// route the error through commandError so `runCommand` sends it to the
	// stream that matches the resolved output mode.
	if (snippet.error) {
		return commandError(mode, 'not-found', snippet.error, Object.keys(spec.components).sort());
	}

	return { output: snippet.output, error: null, exitCode: snippet.exitCode };
}

export function runAdd(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log(
			'Usage: dryui add [--subpath] [--with-theme] [--project [path]] [--json] [--text] [--target <file>] <component>'
		);
		console.log('');
		console.log('Print a copyable component starter snippet or a project-aware plan.');
		console.log('');
		console.log('Options:');
		console.log('  --subpath     Use the per-component subpath import for @dryui/ui');
		console.log('  --with-theme  Include theme imports for standalone setup snippets');
		console.log('  --project     Use the shared project planner instead of snippet mode');
		console.log('                Accepts an optional project path before the component name');
		console.log('  --text        Plain-text plan output (--project only; default is TOON)');
		console.log('  --json        JSON plan output (--project only)');
		console.log('  --target <file>  Choose a target Svelte file for project plans');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const project = args.includes('--project');
	const subpath = args.includes('--subpath');
	const withTheme = args.includes('--with-theme');
	const targetIndex = args.indexOf('--target');
	const target = targetIndex !== -1 ? args[targetIndex + 1] : undefined;

	// Snippet mode (no --project) always produces plain text; output-mode flags
	// only apply in --project mode where we print an AddPlan.
	const { mode: resolvedMode } = resolveOutputMode(args);
	const mode: OutputMode = project ? resolvedMode : 'text';

	if (targetIndex !== -1 && (!target || target.startsWith('--'))) {
		runCommand(commandError(mode, 'missing-value', '--target requires a file path'), mode);
		return;
	}

	const positional = args.filter((arg, index) => {
		if (['--project', '--json', '--text', '--subpath', '--with-theme', '--target'].includes(arg)) {
			return false;
		}
		if (targetIndex !== -1 && index === targetIndex + 1) {
			return false;
		}
		return true;
	});

	if (!project && args.includes('--json')) {
		runCommand(commandError(mode, 'invalid-flag', '--json requires --project'), mode);
		return;
	}

	if (project) {
		const parsed = parseProjectInput(positional, spec);
		if (parsed.error) {
			runCommand(commandError(mode, 'invalid-args', parsed.error), mode);
			return;
		}

		const query = parsed.query;
		if (!query) {
			runCommand(commandError(mode, 'missing-argument', 'add requires a component name'), mode);
			return;
		}

		runCommand(
			getAdd(query, spec, mode, {
				subpath,
				withTheme,
				project,
				...(target ? { target } : {}),
				...(parsed.cwd ? { cwd: parsed.cwd } : {})
			}),
			mode
		);
		return;
	}

	const query = positional[0];
	if (!query) {
		runCommand(commandError(mode, 'missing-argument', 'add requires a component name'), mode);
		return;
	}

	runCommand(
		getAdd(query, spec, mode, {
			subpath,
			withTheme,
			project,
			...(target ? { target } : {})
		}),
		mode
	);
}
