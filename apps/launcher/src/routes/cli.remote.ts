import { spawn } from 'node:child_process';
import { query } from '$app/server';

type CliId = 'claude-code' | 'codex' | 'gemini-cli' | 'copilot-cli' | 'opencode' | 'cursor';

interface CliDef {
	id: CliId;
	command: string;
	versionArgs: string[];
	npmPackage?: string;
}

interface CliValidationResult {
	status: 'found' | 'not-found';
	updateAvailable: boolean;
	version?: string;
	path?: string;
	latest?: string;
}

const CLIS: CliDef[] = [
	{
		id: 'claude-code',
		command: 'claude',
		versionArgs: ['--version'],
		npmPackage: '@anthropic-ai/claude-code'
	},
	{ id: 'codex', command: 'codex', versionArgs: ['--version'], npmPackage: '@openai/codex' },
	{
		id: 'gemini-cli',
		command: 'gemini',
		versionArgs: ['--version'],
		npmPackage: '@google/gemini-cli'
	},
	{
		id: 'copilot-cli',
		command: 'copilot',
		versionArgs: ['--version'],
		npmPackage: '@github/copilot'
	},
	{ id: 'opencode', command: 'opencode', versionArgs: ['--version'], npmPackage: 'opencode-ai' },
	{ id: 'cursor', command: 'agent', versionArgs: ['--version'] }
];

function runCommand(
	command: string,
	args: string[]
): Promise<{ stdout: string; code: number | null }> {
	return new Promise((resolve) => {
		const proc = spawn(command, args, {
			stdio: ['ignore', 'pipe', 'pipe'],
			env: { ...process.env, PATH: process.env['PATH'] }
		});
		let stdout = '';
		proc.stdout.on('data', (chunk: Buffer | string) => {
			stdout += chunk.toString();
		});
		proc.on('error', () => resolve({ stdout: '', code: 1 }));
		proc.on('close', (code: number | null) => resolve({ stdout: stdout.trim(), code }));
	});
}

async function validateOne(def: CliDef): Promise<{ id: CliId } & CliValidationResult> {
	const whichResult = await runCommand('which', [def.command]);
	if (whichResult.code !== 0 || !whichResult.stdout) {
		return { id: def.id, status: 'not-found' as const, updateAvailable: false };
	}

	const path = whichResult.stdout;
	const versionResult = await runCommand(def.command, def.versionArgs);
	const rawVersion = versionResult.code === 0 ? versionResult.stdout.split('\n')[0] : undefined;
	const semver = rawVersion?.match(/(\d+\.\d+\.\d+)/)?.[1];

	let latest: string | undefined;
	let updateAvailable = false;

	if (def.npmPackage && semver) {
		try {
			const resp = await fetch(`https://registry.npmjs.org/${def.npmPackage}/latest`);
			if (resp.ok) {
				const data = (await resp.json()) as { version: string };
				latest = data.version;
				updateAvailable = semver !== latest;
			}
		} catch {}
	}

	return {
		id: def.id,
		status: 'found' as const,
		path,
		updateAvailable,
		...(semver ? { version: semver } : {}),
		...(latest ? { latest } : {})
	};
}

export const getCliValidations = query(async () => {
	const results = await Promise.all(CLIS.map(validateOne));
	return Object.fromEntries(results.map(({ id, ...validation }) => [id, validation])) as Record<
		CliId,
		CliValidationResult
	>;
});
