// dryui check — Static DryUI validation, with an optional rendered visual pass.

import { runVisionCheck, type VisionCheckResult } from '@dryui/mcp/check-vision';
import { runCheckStructured, type CheckResult } from '@dryui/mcp/repair';
import type { Spec } from '@dryui/mcp/spec-types';
import {
	commandError,
	emitCommandResult,
	hasFlag,
	printCommandHelp,
	resolveOutputMode,
	type CommandResult,
	type OutputMode
} from '../run.js';

type CheckScope = 'polish' | 'no-polish';

interface CheckCommandOptions {
	readonly runStatic?: typeof runCheckStructured;
	readonly runVisual?: typeof runVisionCheck;
}

const VALUE_FLAGS = new Set([
	'--cwd',
	'--extra-rubric',
	'--scope',
	'--viewport',
	'--visual',
	'--visual-url',
	'--wait-for'
]);

// Duck-type StructuredToolError so the CLI does not need to expose the MCP
// package's internal error class as a public API.
function isStructuredToolError(
	value: unknown
): value is { name: string; code: string; message: string; suggestions: readonly string[] } {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as { name?: unknown }).name === 'StructuredToolError' &&
		typeof (value as { code?: unknown }).code === 'string'
	);
}

function help(exitCode = 0): never {
	printCommandHelp(
		{
			usage:
				'dryui check [path] [--polish|--no-polish] [--visual <url>] [--viewport=<wxh>] [--wait-for=<selector>]',
			description: [
				'Validate a DryUI file, theme, directory, or workspace through the unified checker.',
				'Without a path, check scans the current workspace. With --visual, it renders',
				'a URL in headless Chromium and asks Codex CLI to critique the screenshot.'
			],
			options: [
				'  --polish             Only run polish-category rules',
				'  --no-polish          Skip polish rules; run correctness + a11y checks',
				'  --scope=<scope>      Equivalent explicit scope: polish or no-polish',
				'  --cwd=<path>         Resolve paths and workspace scans from another directory',
				'  --visual <url>       Run the rendered visual check for a local or public URL',
				'  --visual-url=<url>   Same as --visual <url>',
				'  --viewport=<wxh>     Visual check viewport size (default 1440x900)',
				'  --wait-for=<sel>     Visual check selector to wait for before screenshotting',
				'  --extra-rubric=<s>   Extra visual-review emphasis for Codex',
				'  --text               Plain text output (default is TOON)',
				'  --json               Emit JSON instead of TOON'
			],
			examples: [
				'  dryui check src/routes/+page.svelte',
				'  dryui check --polish',
				'  dryui check --visual http://localhost:5173/dashboard',
				'  dryui check --visual-url=https://example.com --viewport=1280x720'
			]
		},
		exitCode
	);
}

function getOptionValue(args: readonly string[], name: string): string | undefined {
	const eqPrefix = `${name}=`;
	for (const arg of args) {
		if (arg.startsWith(eqPrefix)) {
			const value = arg.slice(eqPrefix.length);
			return value ? value : undefined;
		}
	}

	const index = args.indexOf(name);
	if (index === -1) return undefined;
	const next = args[index + 1];
	if (!next || next.startsWith('--')) return undefined;
	return next;
}

function positionals(args: readonly string[]): string[] {
	const out: string[] = [];
	let skipNext = false;
	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (!arg) continue;
		if (skipNext) {
			skipNext = false;
			continue;
		}
		if (arg.startsWith('--')) {
			const flag = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg;
			if (!arg.includes('=') && VALUE_FLAGS.has(flag)) {
				const next = args[index + 1];
				if (next && !next.startsWith('--')) skipNext = true;
			}
			continue;
		}
		out.push(arg);
	}
	return out;
}

function resolveScope(
	args: readonly string[],
	mode: OutputMode
): CheckScope | undefined | CommandResult {
	const polish = hasFlag(args, '--polish');
	const noPolish = hasFlag(args, '--no-polish');
	const explicit = getOptionValue(args, '--scope');

	if ([polish, noPolish, Boolean(explicit)].filter(Boolean).length > 1) {
		return commandError(
			mode,
			'conflicting-scope',
			'Choose only one check scope: --polish, --no-polish, or --scope.',
			['dryui check --polish', 'dryui check --no-polish']
		);
	}

	if (polish) return 'polish';
	if (noPolish) return 'no-polish';
	if (!explicit) return undefined;
	if (explicit === 'polish' || explicit === 'no-polish') return explicit;
	return commandError(mode, 'invalid-scope', `Unsupported check scope: ${explicit}`, [
		'dryui check --scope=polish',
		'dryui check --scope=no-polish'
	]);
}

function staticOutput(result: CheckResult, mode: OutputMode): string {
	if (mode !== 'json') return result.text;
	return JSON.stringify({ summary: result.summary, diagnostics: result.diagnostics }, null, 2);
}

function visualOutput(result: VisionCheckResult, mode: OutputMode): string {
	if (mode !== 'json') return result.text;
	return JSON.stringify(
		{
			summary: result.summary,
			screenshotPath: result.screenshotPath,
			findings: result.findings,
			diagnostics: result.diagnostics
		},
		null,
		2
	);
}

function structuredErrorResult(error: unknown, mode: OutputMode): CommandResult {
	if (isStructuredToolError(error)) {
		return commandError(mode, error.code, error.message, [...error.suggestions]);
	}
	const message = error instanceof Error ? error.message : String(error);
	return commandError(mode, 'check-failed', message);
}

export async function getCheckCommandResult(
	args: string[],
	spec: Spec,
	mode: OutputMode,
	options: CheckCommandOptions = {}
): Promise<CommandResult> {
	const runStatic = options.runStatic ?? runCheckStructured;
	const runVisual = options.runVisual ?? runVisionCheck;
	const visualUrl = getOptionValue(args, '--visual-url') ?? getOptionValue(args, '--visual');
	const wantsVisual =
		visualUrl !== undefined ||
		hasFlag(args, '--visual') ||
		hasFlag(args, '--visual-url') ||
		args.some((arg) => arg.startsWith('--visual=') || arg.startsWith('--visual-url='));

	if (wantsVisual) {
		if (!visualUrl) {
			return commandError(mode, 'missing-visual-url', 'Missing URL for visual check.', [
				'dryui check --visual http://localhost:5173',
				'dryui check --visual-url=https://example.com'
			]);
		}
		const viewport = getOptionValue(args, '--viewport');
		const waitFor = getOptionValue(args, '--wait-for');
		const extraRubric = getOptionValue(args, '--extra-rubric');
		try {
			const result = await runVisual({
				url: visualUrl,
				...(viewport ? { viewport } : {}),
				...(waitFor ? { waitFor } : {}),
				...(extraRubric ? { extraRubric } : {})
			});
			return {
				output: visualOutput(result, mode),
				error: null,
				exitCode: result.summary.hasBlockers ? 1 : 0
			};
		} catch (error) {
			return structuredErrorResult(error, mode);
		}
	}

	const scope = resolveScope(args, mode);
	if (scope && typeof scope !== 'string') return scope;

	try {
		const path = positionals(args)[0];
		const cwd = getOptionValue(args, '--cwd');
		const result = runStatic(
			spec,
			{
				...(path ? { path } : {}),
				...(scope ? { scope } : {})
			},
			cwd ? { cwd } : {}
		);
		return {
			output: staticOutput(result, mode),
			error: null,
			exitCode: result.summary.hasBlockers ? 1 : 0
		};
	} catch (error) {
		return structuredErrorResult(error, mode);
	}
}

export async function runCheckCommand(args: string[], spec: Spec): Promise<void> {
	if (hasFlag(args, '--help') || hasFlag(args, '-h')) help(0);

	const { mode } = resolveOutputMode(args, true);
	const result = await getCheckCommandResult(args, spec, mode);
	emitCommandResult(result, mode);
	process.exit(result.exitCode);
}
