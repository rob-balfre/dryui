// dryui ask --scope <scope> "<query>" - Scope-driven DryUI discovery

import type { Spec } from './types.js';
import {
	commandError,
	emitCommandResult,
	formatDryuiCliReferences,
	hasFlag,
	printCommandHelp,
	resolveOutputMode,
	type CommandResult,
	type OutputMode
} from '../run.js';
import { runAsk, type AskListKind, type AskScope } from '../../../mcp/src/tools/ask.js';

const ASK_SCOPES = ['component', 'recipe', 'list', 'setup'] as const satisfies readonly AskScope[];
const ASK_KINDS = ['component', 'token'] as const satisfies readonly AskListKind[];
const VALUE_FLAGS = new Set(['--scope', '--kind']);

function help(exitCode = 0): never {
	printCommandHelp(
		{
			usage: 'dryui ask --scope <component|recipe|list|setup> [--kind <component|token>] "<query>"',
			description: [
				'Ask DryUI for scoped discovery guidance using the same engine as the MCP ask tool.',
				'Component and recipe scopes require a query. List and setup can use an empty query.'
			],
			options: [
				'  --scope <scope>  Required discovery scope: component, recipe, list, or setup',
				'  --kind <kind>    Optional list filter: component or token',
				'  --text           Plain-text stream behavior for humans (output content stays TOON)'
			],
			examples: [
				'  dryui ask --scope component Button',
				'  dryui ask --scope recipe "app shell"',
				'  dryui ask --scope list "" --kind token',
				'  dryui ask --scope setup ""'
			]
		},
		exitCode
	);
}

function getOptionValue(args: readonly string[], name: string): string | undefined {
	const eqPrefix = `${name}=`;
	for (const arg of args) {
		if (arg.startsWith(eqPrefix)) return arg.slice(eqPrefix.length);
	}

	const index = args.indexOf(name);
	if (index === -1) return undefined;
	const next = args[index + 1];
	if (next === undefined || next.startsWith('--')) return undefined;
	return next;
}

function positionals(args: readonly string[]): string[] {
	const out: string[] = [];
	let skipNext = false;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === undefined) continue;

		if (skipNext) {
			skipNext = false;
			continue;
		}

		if (arg.startsWith('--')) {
			const flag = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg;
			if (!arg.includes('=') && VALUE_FLAGS.has(flag)) {
				const next = args[index + 1];
				if (next !== undefined && !next.startsWith('--')) skipNext = true;
			}
			continue;
		}

		out.push(arg);
	}

	return out;
}

function isAskScope(value: string | undefined): value is AskScope {
	return ASK_SCOPES.includes(value as AskScope);
}

function isAskKind(value: string | undefined): value is AskListKind {
	return ASK_KINDS.includes(value as AskListKind);
}

function structuredErrorResult(error: unknown, mode: OutputMode): CommandResult {
	if (
		typeof error === 'object' &&
		error !== null &&
		(error as { name?: unknown }).name === 'StructuredToolError' &&
		typeof (error as { code?: unknown }).code === 'string'
	) {
		const structured = error as {
			code: string;
			message: string;
			suggestions?: readonly string[];
		};
		return commandError(mode, structured.code, structured.message, structured.suggestions);
	}

	const message = error instanceof Error ? error.message : String(error);
	return commandError(mode, 'ask-failed', message);
}

export function getAskCommandResult(args: string[], spec: Spec, mode: OutputMode): CommandResult {
	const scope = getOptionValue(args, '--scope');
	if (!scope) {
		return commandError(mode, 'missing-scope', 'dryui ask requires --scope <scope>', [
			'dryui ask --scope component Button',
			'dryui ask --scope list ""',
			'dryui ask --scope setup ""'
		]);
	}

	if (!isAskScope(scope)) {
		return commandError(
			mode,
			'invalid-scope',
			`Invalid scope "${scope}". Available: ${ASK_SCOPES.join(', ')}`,
			ASK_SCOPES.map((validScope) => `dryui ask --scope ${validScope} "<query>"`)
		);
	}

	const kind = getOptionValue(args, '--kind');
	if (kind !== undefined && !isAskKind(kind)) {
		return commandError(
			mode,
			'invalid-kind',
			`Invalid kind "${kind}". Available: ${ASK_KINDS.join(', ')}`,
			ASK_KINDS.map((validKind) => `dryui ask --scope list --kind ${validKind} ""`)
		);
	}

	const query = positionals(args).join(' ').trim();

	try {
		return {
			output: formatDryuiCliReferences(
				runAsk(
					spec,
					{
						query,
						scope,
						...(kind ? { kind } : {})
					},
					{ cwd: process.cwd() }
				)
			),
			error: null,
			exitCode: 0
		};
	} catch (error) {
		return structuredErrorResult(error, mode);
	}
}

export function runAskCommand(args: string[], spec: Spec): void {
	if (hasFlag(args, '--help') || hasFlag(args, '-h')) help(0);

	const { mode } = resolveOutputMode(args, false);
	const result = getAskCommandResult(args, spec, mode);
	emitCommandResult(result, mode);
	process.exit(result.exitCode);
}
