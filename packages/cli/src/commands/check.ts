// dryui check — Static DryUI validation.

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

interface CheckCommandOptions {
	readonly runStatic?: typeof runCheckStructured;
}

const VALUE_FLAGS = new Set(['--cwd']);

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
			usage: 'dryui check [path] [--cwd=<path>]',
			description: [
				'Validate a DryUI file, theme, directory, or workspace. Runs component',
				'contracts, a11y, tokens, and CSS discipline checks. Without a path,',
				'check scans the current workspace.',
				'',
				'For design-quality flows (brief, critique, polish, visual review),',
				'use impeccable: https://impeccable.style'
			],
			options: [
				'  --cwd=<path>    Resolve paths and workspace scans from another directory',
				'  --text          Plain text output (default is TOON)',
				'  --json          Emit JSON instead of TOON'
			],
			examples: [
				'  dryui check src/routes/+page.svelte',
				'  dryui check',
				'  dryui check --cwd=./my-project src/lib/'
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

function staticOutput(result: CheckResult, mode: OutputMode): string {
	if (mode !== 'json') return result.text;
	return JSON.stringify({ summary: result.summary, diagnostics: result.diagnostics }, null, 2);
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

	try {
		const path = positionals(args)[0];
		const cwd = getOptionValue(args, '--cwd');
		const result = runStatic(
			spec,
			{
				...(path ? { path } : {})
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
