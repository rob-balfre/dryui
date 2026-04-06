import { spawn } from 'node:child_process';
import type { CliDefinition, CliId, ServerMessage } from './types.ts';

export const CLI_DEFINITIONS: readonly CliDefinition[] = [
	{
		id: 'claude-code',
		name: 'Claude Code',
		command: 'claude',
		versionArgs: ['--version'],
		vendor: 'Anthropic',
		npmPackage: '@anthropic-ai/claude-code'
	},
	{
		id: 'codex',
		name: 'Codex',
		command: 'codex',
		versionArgs: ['--version'],
		vendor: 'OpenAI',
		npmPackage: '@openai/codex'
	},
	{
		id: 'gemini-cli',
		name: 'Gemini CLI',
		command: 'gemini',
		versionArgs: ['--version'],
		vendor: 'Google',
		npmPackage: '@google/gemini-cli'
	},
	{
		id: 'copilot-cli',
		name: 'Copilot CLI',
		command: 'copilot',
		versionArgs: ['--version'],
		vendor: 'GitHub',
		npmPackage: '@github/copilot'
	},
	{
		id: 'opencode',
		name: 'OpenCode',
		command: 'opencode',
		versionArgs: ['--version'],
		vendor: 'OpenCode',
		npmPackage: 'opencode-ai'
	},
	{
		id: 'cursor',
		name: 'Cursor',
		command: 'agent',
		versionArgs: ['--version'],
		vendor: 'Cursor'
	}
];

function runCommand(
	command: string,
	args: readonly string[]
): Promise<{ stdout: string; code: number | null }> {
	return new Promise((resolve) => {
		const proc = spawn(command, args as string[], {
			stdio: ['ignore', 'pipe', 'pipe'],
			env: { ...process.env, PATH: process.env['PATH'] }
		});

		let stdout = '';
		proc.stdout.on('data', (chunk: Buffer) => {
			stdout += chunk.toString();
		});

		proc.on('error', () => {
			resolve({ stdout: '', code: 1 });
		});

		proc.on('close', (code) => {
			resolve({ stdout: stdout.trim(), code });
		});
	});
}

export async function validateCli(
	cliId: CliId
): Promise<ServerMessage & { type: 'validation-result' }> {
	const def = CLI_DEFINITIONS.find((d) => d.id === cliId);
	if (!def) {
		return {
			type: 'validation-result',
			cli: cliId,
			status: 'error',
			error: `Unknown CLI: ${cliId}`
		};
	}

	// Check if command exists
	const whichResult = await runCommand('which', [def.command]);
	if (whichResult.code !== 0 || !whichResult.stdout) {
		return { type: 'validation-result', cli: cliId, status: 'not-found' };
	}

	const resolvedPath = whichResult.stdout;

	// Get version
	const versionResult = await runCommand(def.command, def.versionArgs);
	const version = versionResult.code === 0 ? versionResult.stdout.split('\n')[0] : undefined;

	return {
		type: 'validation-result',
		cli: cliId,
		status: 'found',
		version,
		path: resolvedPath
	};
}
