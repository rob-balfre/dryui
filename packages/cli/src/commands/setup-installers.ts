// dryui setup --install — Run the install steps for an editor's setup guide.
//
// Each installer:
//   1. Pulls the DryUI skill into the editor's expected folder via `npx degit`.
//   2. Merges the canonical MCP server block into the editor's JSON config,
//      preserving any other servers and unrelated keys the user has set.
//
// Auto-install is intentionally limited to editors where both steps map onto
// project-local files plus dedicated MCP config files. claude-code and codex
// keep their guide-only flow because their canonical install requires an
// interactive `/plugins` session in the editor itself.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { homeRelative } from '../run.js';
import type { SetupGuideId } from './setup-guides.js';

export type InstallStepStatus = 'created' | 'merged' | 'unchanged' | 'failed';

export interface InstallStepResult {
	label: string;
	status: InstallStepStatus;
	detail: string;
}

export interface InstallContext {
	cwd: string;
	homeDir?: string;
	runDegit?: (target: string) => DegitOutcome;
}

export interface InstallResult {
	editor: SetupGuideId;
	steps: InstallStepResult[];
	ok: boolean;
}

export interface DegitOutcome {
	ok: boolean;
	message: string;
}

const SKILL_SOURCE = 'rob-balfre/dryui/packages/ui/skills/dryui';

const NPX_DRYUI_MCP = { command: 'npx', args: ['-y', '@dryui/mcp'] } as const;
const NPX_DRYUI_FEEDBACK_MCP = {
	command: 'npx',
	args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
} as const;

function defaultRunDegit(target: string): DegitOutcome {
	const result = spawnSync('npx', ['-y', 'degit', '--force', SKILL_SOURCE, target], {
		stdio: 'pipe',
		encoding: 'utf-8'
	});

	if (result.error) {
		return { ok: false, message: `unable to spawn npx: ${result.error.message}` };
	}
	if (result.status !== 0) {
		const stderr = result.stderr?.trim() || result.stdout?.trim() || '';
		return { ok: false, message: stderr || `degit exited with code ${result.status}` };
	}
	return { ok: true, message: `pulled ${SKILL_SOURCE}` };
}

function copySkill(target: string, runDegit: (target: string) => DegitOutcome): InstallStepResult {
	const absolute = resolve(target);
	try {
		mkdirSync(dirname(absolute), { recursive: true });
	} catch (error) {
		return {
			label: 'Copy DryUI skill',
			status: 'failed',
			detail: `unable to create ${homeRelative(dirname(absolute))}: ${errorMessage(error)}`
		};
	}

	const outcome = runDegit(absolute);
	if (!outcome.ok) {
		return {
			label: 'Copy DryUI skill',
			status: 'failed',
			detail: `${homeRelative(absolute)}: ${outcome.message}`
		};
	}

	return {
		label: 'Copy DryUI skill',
		status: 'created',
		detail: homeRelative(absolute)
	};
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

interface MergeServersOptions {
	path: string;
	containerKey: string;
	servers: Record<string, unknown>;
	defaultRoot?: Record<string, unknown>;
	label: string;
}

export function mergeServersConfig(options: MergeServersOptions): InstallStepResult {
	const absolute = resolve(options.path);
	const existed = existsSync(absolute);

	let parsed: Record<string, unknown> = {};
	if (existed) {
		const raw = readFileSync(absolute, 'utf-8').trim();
		if (raw) {
			try {
				const value = JSON.parse(raw);
				if (typeof value !== 'object' || value === null || Array.isArray(value)) {
					return {
						label: options.label,
						status: 'failed',
						detail: `${homeRelative(absolute)}: must be a JSON object`
					};
				}
				parsed = value as Record<string, unknown>;
			} catch (error) {
				return {
					label: options.label,
					status: 'failed',
					detail: `${homeRelative(absolute)}: invalid JSON (${errorMessage(error)}). Edit the file or remove comments before retrying.`
				};
			}
		}
	}

	const baseRoot = existed ? parsed : { ...(options.defaultRoot ?? {}), ...parsed };
	const existingContainer = baseRoot[options.containerKey];
	const containerObj =
		existingContainer && typeof existingContainer === 'object' && !Array.isArray(existingContainer)
			? (existingContainer as Record<string, unknown>)
			: {};

	let changed = !existed;
	const mergedContainer: Record<string, unknown> = { ...containerObj };
	for (const [key, value] of Object.entries(options.servers)) {
		const before = JSON.stringify(mergedContainer[key]);
		const next = JSON.stringify(value);
		if (before !== next) changed = true;
		mergedContainer[key] = value;
	}

	if (existed && !changed) {
		return {
			label: options.label,
			status: 'unchanged',
			detail: `${homeRelative(absolute)} already up to date`
		};
	}

	const next = { ...baseRoot, [options.containerKey]: mergedContainer };

	try {
		mkdirSync(dirname(absolute), { recursive: true });
		writeFileSync(absolute, JSON.stringify(next, null, 2) + '\n');
	} catch (error) {
		return {
			label: options.label,
			status: 'failed',
			detail: `${homeRelative(absolute)}: ${errorMessage(error)}`
		};
	}

	return {
		label: options.label,
		status: existed ? 'merged' : 'created',
		detail: homeRelative(absolute)
	};
}

function finalize(editor: SetupGuideId, steps: InstallStepResult[]): InstallResult {
	return {
		editor,
		steps,
		ok: steps.every((step) => step.status !== 'failed')
	};
}

function copilotInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.github/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		path: join(ctx.cwd, '.vscode/mcp.json'),
		containerKey: 'servers',
		servers: { dryui: { type: 'stdio', ...NPX_DRYUI_MCP } },
		label: 'Update .vscode/mcp.json'
	});
	return finalize('copilot', [skill, config]);
}

function cursorInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.agents/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		path: join(ctx.cwd, '.cursor/mcp.json'),
		containerKey: 'mcpServers',
		servers: { dryui: NPX_DRYUI_MCP },
		label: 'Update .cursor/mcp.json'
	});
	return finalize('cursor', [skill, config]);
}

function opencodeInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.opencode/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		path: join(ctx.cwd, 'opencode.json'),
		containerKey: 'mcp',
		servers: {
			dryui: { type: 'local', command: ['npx', '-y', '@dryui/mcp'] },
			'dryui-feedback': {
				type: 'local',
				command: ['npx', '-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
			}
		},
		defaultRoot: { $schema: 'https://opencode.ai/config.json' },
		label: 'Update opencode.json'
	});
	return finalize('opencode', [skill, config]);
}

function windsurfInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const home = ctx.homeDir ?? homedir();
	const skill = copySkill(join(ctx.cwd, '.agents/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		path: join(home, '.codeium/windsurf/mcp_config.json'),
		containerKey: 'mcpServers',
		servers: { dryui: NPX_DRYUI_MCP, 'dryui-feedback': NPX_DRYUI_FEEDBACK_MCP },
		label: 'Update ~/.codeium/windsurf/mcp_config.json'
	});
	return finalize('windsurf', [skill, config]);
}

function zedInstaller(ctx: InstallContext): InstallResult {
	const home = ctx.homeDir ?? homedir();
	const config = mergeServersConfig({
		path: join(home, '.config/zed/settings.json'),
		containerKey: 'context_servers',
		servers: { dryui: { command: { path: 'npx', args: ['-y', '@dryui/mcp'] } } },
		label: 'Update ~/.config/zed/settings.json'
	});
	return finalize('zed', [config]);
}

const INSTALLERS: Partial<Record<SetupGuideId, (ctx: InstallContext) => InstallResult>> = {
	copilot: copilotInstaller,
	cursor: cursorInstaller,
	opencode: opencodeInstaller,
	windsurf: windsurfInstaller,
	zed: zedInstaller
};

export function isAutoInstallable(id: SetupGuideId): boolean {
	return id in INSTALLERS;
}

export function autoInstallableEditors(): readonly SetupGuideId[] {
	return Object.keys(INSTALLERS) as SetupGuideId[];
}

export function runEditorInstall(id: SetupGuideId, ctx: InstallContext): InstallResult | null {
	const installer = INSTALLERS[id];
	if (!installer) return null;
	return installer(ctx);
}

export function installPreviewLines(id: SetupGuideId, ctx: InstallContext): readonly string[] {
	const home = ctx.homeDir ?? homedir();
	switch (id) {
		case 'copilot':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.github/skills/dryui'))}`,
				`• Merge dryui server into ${homeRelative(join(ctx.cwd, '.vscode/mcp.json'))}`
			];
		case 'cursor':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.agents/skills/dryui'))}`,
				`• Merge dryui server into ${homeRelative(join(ctx.cwd, '.cursor/mcp.json'))}`
			];
		case 'opencode':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.opencode/skills/dryui'))}`,
				`• Merge dryui + dryui-feedback servers into ${homeRelative(join(ctx.cwd, 'opencode.json'))}`
			];
		case 'windsurf':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.agents/skills/dryui'))}`,
				`• Merge dryui + dryui-feedback into ${homeRelative(join(home, '.codeium/windsurf/mcp_config.json'))}`
			];
		case 'zed':
			return [
				`• Merge dryui context server into ${homeRelative(join(home, '.config/zed/settings.json'))}`
			];
		default:
			return [];
	}
}

export function formatInstallResult(result: InstallResult): string {
	const lines: string[] = ['Install:'];
	for (const step of result.steps) {
		lines.push(`  ${step.label}: ${step.status}`);
		if (step.detail) lines.push(`    ${step.detail}`);
	}
	if (!result.ok) {
		lines.push('');
		lines.push(
			'Some steps failed. Re-run after fixing the issue, or apply the printed steps manually.'
		);
	} else {
		lines.push('');
		lines.push('Restart your editor to pick up the new MCP config.');
	}
	return lines.join('\n');
}
