// dryui check-vision <url> — Render a URL and have Codex critique the screenshot.

import { runVisionCheck } from '@dryui/mcp/check-vision';
import {
	commandError,
	emitCommandResult,
	getFlag,
	hasFlag,
	printCommandHelp,
	type OutputMode
} from '../run.js';

// Duck-type StructuredToolError so we don't need a public import for it. The
// MCP package owns the class; the CLI just needs the code/suggestions surface.
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
			usage: 'dryui check-vision <url> [--viewport=<wxh>] [--wait-for=<selector>]',
			description: [
				'Render <url> in headless Chromium and have Codex CLI critique the screenshot',
				'against the DryUI taste rubric (chip wrap, plural mismatch, variant mix,',
				'mid-token break, contrast, alignment, orphan, spacing rhythm).',
				'',
				'This is a compatibility alias for `dryui check --visual <url>`.',
				'',
				'Requires the Codex CLI on PATH and an authenticated Codex session.'
			],
			options: [
				'  --viewport=<wxh>     Viewport size (default 1440x900)',
				'  --wait-for=<sel>     CSS selector to wait for before screenshotting',
				'  --extra-rubric=<s>   Extra emphasis appended to the user message',
				'  --text               Plain text output (default is TOON)',
				'  --json               Emit JSON instead of TOON'
			],
			examples: [
				'  dryui check --visual http://localhost:5173/components/badge',
				'  dryui check-vision http://localhost:5173/components/badge',
				'  dryui check-vision https://example.com --viewport=1280x720',
				'  dryui check-vision http://localhost:5173/dashboard --wait-for=.demo-surface'
			]
		},
		exitCode
	);
}

function resolveMode(args: string[]): OutputMode {
	if (args.includes('--text')) return 'text';
	if (args.includes('--json')) return 'json';
	return 'toon';
}

export async function runCheckVision(args: string[]): Promise<void> {
	if (args.length === 0 || hasFlag(args, '--help')) {
		help(args.length === 0 ? 1 : 0);
	}

	const positionals = args.filter((arg) => !arg.startsWith('--'));
	const url = positionals[0];
	if (!url) help(1);

	const mode = resolveMode(args);
	const viewport = getFlag(args, '--viewport');
	const waitFor = getFlag(args, '--wait-for');
	const extraRubric = getFlag(args, '--extra-rubric');

	try {
		const result = await runVisionCheck({
			url,
			...(viewport ? { viewport } : {}),
			...(waitFor ? { waitFor } : {}),
			...(extraRubric ? { extraRubric } : {})
		});

		const exitCode = result.summary.hasBlockers ? 1 : 0;
		const output =
			mode === 'json'
				? JSON.stringify(
						{
							summary: result.summary,
							screenshotPath: result.screenshotPath,
							findings: result.findings,
							diagnostics: result.diagnostics
						},
						null,
						2
					)
				: result.text;

		emitCommandResult({ output, error: null, exitCode }, mode);
		process.exit(exitCode);
	} catch (error) {
		if (isStructuredToolError(error)) {
			emitCommandResult(
				commandError(mode, error.code, error.message, [...error.suggestions]),
				mode
			);
			process.exit(1);
		}
		const message = error instanceof Error ? error.message : String(error);
		emitCommandResult(commandError(mode, 'vision-failed', message), mode);
		process.exit(1);
	}
}
