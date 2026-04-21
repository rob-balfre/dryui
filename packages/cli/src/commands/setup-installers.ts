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

import {
	createProbeCache,
	hasJsonEntry,
	hasTomlSection,
	readJsonObject,
	readRawText,
	type ProbeCache
} from '@dryui/feedback-server/internals/probe';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
	runProcess?: (command: string, args: readonly string[]) => ProcessOutcome;
	includeSvelteMcp?: boolean;
}

export interface InstallResult {
	editor: SetupGuideId;
	steps: InstallStepResult[];
	ok: boolean;
}

export interface AgentSetupStatus {
	editor: SetupGuideId;
	dryui: boolean;
	feedback: boolean;
	svelte: boolean;
	source: 'plugin' | 'mcp' | 'mixed' | 'none';
}

export interface AgentSetupEntry {
	editor: SetupGuideId;
	displayName: string;
	plugin: boolean;
	mcp: boolean;
	feedback: boolean;
	svelte: boolean;
}

export interface DegitOutcome {
	ok: boolean;
	message: string;
}

export interface ProcessOutcome {
	ok: boolean;
	message: string;
}

const SKILL_SOURCE = 'rob-balfre/dryui/packages/ui/skills/dryui';

const NPX_DRYUI_MCP = { command: 'npx', args: ['-y', '@dryui/mcp'] } as const;
const NPX_DRYUI_FEEDBACK_MCP = {
	command: 'npx',
	args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
} as const;
const NPX_SVELTE_MCP = { command: 'npx', args: ['-y', '@sveltejs/mcp'] } as const;

function maybeSvelte<T>(
	ctx: InstallContext,
	build: () => T
): { svelte: T } | Record<string, never> {
	return ctx.includeSvelteMcp ? { svelte: build() } : {};
}

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

function defaultRunProcess(command: string, args: readonly string[]): ProcessOutcome {
	const result = spawnSync(command, args, {
		stdio: 'pipe',
		encoding: 'utf-8'
	});

	if (result.error) {
		return { ok: false, message: `unable to spawn ${command}: ${result.error.message}` };
	}
	if (result.status !== 0) {
		const stderr = result.stderr?.trim() || result.stdout?.trim() || '';
		return { ok: false, message: stderr || `${command} exited with code ${result.status}` };
	}

	const stdout = result.stdout?.trim();
	return { ok: true, message: stdout || `${command} ${args.join(' ')}` };
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

function runProcessStep(
	label: string,
	command: string,
	args: readonly string[],
	runProcess: (command: string, args: readonly string[]) => ProcessOutcome
): InstallStepResult {
	const outcome = runProcess(command, args);
	return {
		label,
		status: outcome.ok ? 'created' : 'failed',
		detail: outcome.message
	};
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

interface MergeTomlSectionOptions {
	path: string;
	section: string;
	block: string;
	label: string;
}

export function mergeTomlSection(options: MergeTomlSectionOptions): InstallStepResult {
	const absolute = resolve(options.path);
	const existed = existsSync(absolute);
	if (hasTomlSection(absolute, options.section)) {
		return {
			label: options.label,
			status: 'unchanged',
			detail: `${homeRelative(absolute)} already includes [${options.section}]`
		};
	}

	let existing = '';
	try {
		existing = existsSync(absolute) ? readFileSync(absolute, 'utf-8') : '';
	} catch (error) {
		return {
			label: options.label,
			status: 'failed',
			detail: `${homeRelative(absolute)}: ${errorMessage(error)}`
		};
	}

	const prefix = existing.trim().length === 0 ? '' : existing.endsWith('\n') ? '\n' : '\n\n';
	const next = `${existing}${prefix}${options.block.trim()}\n`;

	try {
		mkdirSync(dirname(absolute), { recursive: true });
		writeFileSync(absolute, next);
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

interface EditorMcpConfig {
	containerKey: string;
	configPath: (ctx: InstallContext) => string;
	label: (configPath: string) => string;
}

const EDITOR_MCP_CONFIG: Partial<Record<SetupGuideId, EditorMcpConfig>> = {
	copilot: {
		containerKey: 'mcpServers',
		configPath: (ctx) => join(ctx.cwd, '.mcp.json'),
		label: () => 'Update .mcp.json'
	},
	cursor: {
		containerKey: 'mcpServers',
		configPath: (ctx) => join(ctx.cwd, '.cursor/mcp.json'),
		label: () => 'Update .cursor/mcp.json'
	},
	gemini: {
		containerKey: 'mcpServers',
		configPath: (ctx) => join(ctx.homeDir ?? homedir(), '.gemini/settings.json'),
		label: () => 'Update ~/.gemini/settings.json'
	},
	opencode: {
		containerKey: 'mcp',
		configPath: (ctx) => join(ctx.cwd, 'opencode.json'),
		label: () => 'Update opencode.json'
	},
	windsurf: {
		containerKey: 'mcpServers',
		configPath: (ctx) => join(ctx.homeDir ?? homedir(), '.codeium/windsurf/mcp_config.json'),
		label: () => 'Update ~/.codeium/windsurf/mcp_config.json'
	},
	zed: {
		containerKey: 'context_servers',
		configPath: (ctx) => join(ctx.homeDir ?? homedir(), '.config/zed/settings.json'),
		label: () => 'Update ~/.config/zed/settings.json'
	}
};

function editorMcpParams(
	editor: SetupGuideId,
	ctx: InstallContext
): Pick<MergeServersOptions, 'path' | 'containerKey' | 'label'> {
	const config = EDITOR_MCP_CONFIG[editor]!;
	const path = config.configPath(ctx);
	return { path, containerKey: config.containerKey, label: config.label(path) };
}

function svelteServerEntry(editor: SetupGuideId): Record<string, unknown> | null {
	switch (editor) {
		case 'copilot':
			return { type: 'stdio', ...NPX_SVELTE_MCP };
		case 'cursor':
		case 'windsurf':
		case 'gemini':
			return { ...NPX_SVELTE_MCP };
		case 'opencode':
			return {
				type: 'local',
				command: ['npx', '-y', '@sveltejs/mcp']
			};
		case 'zed':
			return {
				command: { path: 'npx', args: ['-y', '@sveltejs/mcp'] }
			};
		default:
			return null;
	}
}

function copilotInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.github/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		...editorMcpParams('copilot', ctx),
		servers: {
			dryui: { type: 'stdio', ...NPX_DRYUI_MCP },
			'dryui-feedback': { type: 'stdio', ...NPX_DRYUI_FEEDBACK_MCP },
			...maybeSvelte(ctx, () => ({ type: 'stdio', ...NPX_SVELTE_MCP }))
		}
	});
	return finalize('copilot', [skill, config]);
}

function cursorInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.agents/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		...editorMcpParams('cursor', ctx),
		servers: {
			dryui: NPX_DRYUI_MCP,
			...maybeSvelte(ctx, () => NPX_SVELTE_MCP)
		}
	});
	return finalize('cursor', [skill, config]);
}

function opencodeInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.opencode/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		...editorMcpParams('opencode', ctx),
		servers: {
			dryui: { type: 'local', command: ['npx', '-y', '@dryui/mcp'] },
			'dryui-feedback': {
				type: 'local',
				command: ['npx', '-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
			},
			...maybeSvelte(ctx, () => ({
				type: 'local',
				command: ['npx', '-y', '@sveltejs/mcp']
			}))
		},
		defaultRoot: { $schema: 'https://opencode.ai/config.json' }
	});
	return finalize('opencode', [skill, config]);
}

function windsurfInstaller(ctx: InstallContext): InstallResult {
	const runDegit = ctx.runDegit ?? defaultRunDegit;
	const skill = copySkill(join(ctx.cwd, '.agents/skills/dryui'), runDegit);
	const config = mergeServersConfig({
		...editorMcpParams('windsurf', ctx),
		servers: {
			dryui: NPX_DRYUI_MCP,
			'dryui-feedback': NPX_DRYUI_FEEDBACK_MCP,
			...maybeSvelte(ctx, () => NPX_SVELTE_MCP)
		}
	});
	return finalize('windsurf', [skill, config]);
}

// Gemini has a native extension path (`gemini extensions install packages/plugin`)
// that bundles both MCP servers plus GEMINI.md. This installer is the MCP-only
// fallback for users who can't run the extension path — it wires both servers
// into ~/.gemini/settings.json so feedback works without the extension.
function geminiInstaller(ctx: InstallContext): InstallResult {
	const config = mergeServersConfig({
		...editorMcpParams('gemini', ctx),
		servers: {
			dryui: NPX_DRYUI_MCP,
			'dryui-feedback': NPX_DRYUI_FEEDBACK_MCP,
			...maybeSvelte(ctx, () => NPX_SVELTE_MCP)
		}
	});
	return finalize('gemini', [config]);
}

function zedInstaller(ctx: InstallContext): InstallResult {
	const config = mergeServersConfig({
		...editorMcpParams('zed', ctx),
		servers: {
			dryui: { command: { path: 'npx', args: ['-y', '@dryui/mcp'] } },
			...maybeSvelte(ctx, () => ({ command: { path: 'npx', args: ['-y', '@sveltejs/mcp'] } }))
		}
	});
	return finalize('zed', [config]);
}

const INSTALLERS: Partial<Record<SetupGuideId, (ctx: InstallContext) => InstallResult>> = {
	copilot: copilotInstaller,
	cursor: cursorInstaller,
	gemini: geminiInstaller,
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

function hasInstalledPlugin(path: string, pluginId: string, cache?: ProbeCache): boolean {
	const parsed = readJsonObject(path, cache);
	if (!parsed) return false;

	const plugins = parsed.plugins;
	return Boolean(
		plugins &&
		typeof plugins === 'object' &&
		!Array.isArray(plugins) &&
		Array.isArray((plugins as Record<string, unknown>)[pluginId])
	);
}

function hasClaudeMarketplace(home: string, marketplaceId: string, cache?: ProbeCache): boolean {
	const parsed = readJsonObject(join(home, '.claude/plugins/known_marketplaces.json'), cache);
	return Boolean(parsed && marketplaceId in parsed);
}

export function svelteCompanionPreviewLines(
	id: SetupGuideId,
	ctx: InstallContext
): readonly string[] {
	if (id === 'claude-code') {
		return [
			'• Install the official `svelte@svelte` Claude plugin if it is missing',
			'• Falls back to the existing plugin state when already present'
		];
	}
	if (id === 'codex') {
		return [
			`• Append [mcp_servers.svelte] to ${homeRelative(join(ctx.homeDir ?? homedir(), '.codex/config.toml'))}`
		];
	}
	const config = EDITOR_MCP_CONFIG[id];
	if (!config) return [];
	return [`• Merge the svelte server into ${homeRelative(config.configPath(ctx))}`];
}

export function runSvelteCompanionInstall(
	id: SetupGuideId,
	ctx: InstallContext
): InstallResult | null {
	const cache = createProbeCache();
	const status = probeAgentSetup(id, ctx, cache);
	if (status.svelte) {
		return finalize(id, [
			{
				label: 'Install Svelte companion',
				status: 'unchanged',
				detail: `${shortEditorName(id)} already has the Svelte companion wired`
			}
		]);
	}

	const home = ctx.homeDir ?? homedir();
	const runProcess = ctx.runProcess ?? defaultRunProcess;
	if (id === 'claude-code') {
		const settingsPath = join(home, '.claude/settings.json');
		const pluginsPath = join(home, '.claude/plugins/installed_plugins.json');
		const steps: InstallStepResult[] = [];
		const installed = hasInstalledPlugin(pluginsPath, 'svelte@svelte', cache);
		const enabled = hasEnabledPlugin(settingsPath, 'svelte@svelte', cache);
		if (installed && !enabled) {
			steps.push(
				runProcessStep(
					'Enable Svelte plugin',
					'claude',
					['plugin', 'enable', 'svelte@svelte'],
					runProcess
				)
			);
			return finalize(id, steps);
		}

		if (hasClaudeMarketplace(home, 'svelte', cache)) {
			steps.push({
				label: 'Add Svelte marketplace',
				status: 'unchanged',
				detail: '~/.claude/plugins/known_marketplaces.json already includes svelte'
			});
		} else {
			steps.push(
				runProcessStep(
					'Add Svelte marketplace',
					'claude',
					['plugin', 'marketplace', 'add', 'sveltejs/ai-tools'],
					runProcess
				)
			);
		}

		steps.push(
			runProcessStep(
				'Install Svelte plugin',
				'claude',
				['plugin', 'install', 'svelte@svelte'],
				runProcess
			)
		);
		return finalize(id, steps);
	}

	if (id === 'codex') {
		return finalize(id, [
			mergeTomlSection({
				path: join(home, '.codex/config.toml'),
				section: 'mcp_servers.svelte',
				block: `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]`,
				label: 'Update ~/.codex/config.toml'
			})
		]);
	}

	const entry = svelteServerEntry(id);
	if (!entry) return null;
	return finalize(id, [
		mergeServersConfig({
			...editorMcpParams(id, ctx),
			servers: { svelte: entry }
		})
	]);
}

export function installPreviewLines(id: SetupGuideId, ctx: InstallContext): readonly string[] {
	const home = ctx.homeDir ?? homedir();
	const svelteSuffix = ctx.includeSvelteMcp ? ' + svelte' : '';
	switch (id) {
		case 'copilot':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.github/skills/dryui'))}`,
				`• Merge dryui + dryui-feedback${svelteSuffix} servers into ${homeRelative(join(ctx.cwd, '.mcp.json'))}`
			];
		case 'cursor':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.agents/skills/dryui'))}`,
				`• Merge dryui${svelteSuffix} server into ${homeRelative(join(ctx.cwd, '.cursor/mcp.json'))}`
			];
		case 'opencode':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.opencode/skills/dryui'))}`,
				`• Merge dryui + dryui-feedback${svelteSuffix} servers into ${homeRelative(join(ctx.cwd, 'opencode.json'))}`
			];
		case 'gemini':
			return [
				`• Merge dryui + dryui-feedback${svelteSuffix} servers into ${homeRelative(join(home, '.gemini/settings.json'))}`
			];
		case 'windsurf':
			return [
				`• Copy DryUI skill to ${homeRelative(join(ctx.cwd, '.agents/skills/dryui'))}`,
				`• Merge dryui + dryui-feedback${svelteSuffix} into ${homeRelative(join(home, '.codeium/windsurf/mcp_config.json'))}`
			];
		case 'zed':
			return [
				`• Merge dryui${svelteSuffix} context server into ${homeRelative(join(home, '.config/zed/settings.json'))}`
			];
		default:
			return [];
	}
}

interface SvelteMcpRegistration {
	editor: SetupGuideId;
	configPath: string;
	status: 'registered' | 'not-registered' | 'missing' | 'invalid';
}

function hasEnabledPlugin(path: string, pluginId: string, cache?: ProbeCache): boolean {
	const parsed = readJsonObject(path, cache);
	if (!parsed) return false;

	const enabledPlugins = parsed.enabledPlugins;
	return Boolean(
		enabledPlugins &&
		typeof enabledPlugins === 'object' &&
		!Array.isArray(enabledPlugins) &&
		(enabledPlugins as Record<string, unknown>)[pluginId] === true
	);
}

function getClaudePluginInstallPath(
	home: string,
	pluginId: string,
	cache?: ProbeCache
): string | null {
	const parsed = readJsonObject(join(home, '.claude/plugins/installed_plugins.json'), cache);
	if (!parsed) return null;

	const plugins = parsed.plugins;
	if (!plugins || typeof plugins !== 'object' || Array.isArray(plugins)) return null;
	const installs = (plugins as Record<string, unknown>)[pluginId];
	if (!Array.isArray(installs) || installs.length === 0) return null;

	const candidate = installs[0];
	if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
	const installPath = (candidate as Record<string, unknown>).installPath;
	return typeof installPath === 'string' ? installPath : null;
}

function getPluginMcpConfigPath(
	installPath: string,
	manifestPath: string,
	cache?: ProbeCache
): string | null {
	const manifest = readJsonObject(join(installPath, manifestPath), cache);
	if (!manifest) return null;
	const mcpServers = manifest.mcpServers;
	return typeof mcpServers === 'string' ? join(installPath, mcpServers) : null;
}

function hasClaudePluginServer(
	home: string,
	pluginId: string,
	serverName: string,
	cache?: ProbeCache
): boolean {
	const installPath = getClaudePluginInstallPath(home, pluginId, cache);
	if (!installPath) return false;

	const fromManifest = getPluginMcpConfigPath(installPath, '.claude-plugin/plugin.json', cache);
	if (fromManifest && hasJsonEntry(fromManifest, 'mcpServers', serverName, cache)) {
		return true;
	}

	return hasJsonEntry(join(installPath, '.mcp.json'), 'mcpServers', serverName, cache);
}

// Gemini extensions live at ~/.gemini/extensions/<folder>/gemini-extension.json.
// The folder name isn't always the extension name, so try the conventional
// `<name>/` folder first and fall back to a full scan keyed by manifest `name`.
function findGeminiExtensionManifest(
	home: string,
	extensionName: string,
	cache?: ProbeCache
): string | null {
	const extensionsDir = join(home, '.gemini/extensions');
	const conventional = join(extensionsDir, extensionName, 'gemini-extension.json');
	const direct = readJsonObject(conventional, cache);
	if (direct && direct.name === extensionName) return conventional;

	let entries: string[];
	try {
		entries = readdirSync(extensionsDir);
	} catch {
		return null;
	}
	for (const entry of entries) {
		if (entry === extensionName) continue;
		const manifestPath = join(extensionsDir, entry, 'gemini-extension.json');
		const parsed = readJsonObject(manifestPath, cache);
		if (parsed && parsed.name === extensionName) return manifestPath;
	}
	return null;
}

function deriveSource(plugin: boolean, mcp: boolean): AgentSetupStatus['source'] {
	if (plugin && mcp) return 'mixed';
	if (plugin) return 'plugin';
	if (mcp) return 'mcp';
	return 'none';
}

function probeAgentSetup(
	editor: SetupGuideId,
	ctx: InstallContext,
	cache?: ProbeCache
): AgentSetupStatus {
	const home = ctx.homeDir ?? homedir();

	if (editor === 'claude-code') {
		const claudeSettings = join(home, '.claude/settings.json');
		const plugin = hasEnabledPlugin(claudeSettings, 'dryui@dryui', cache);
		const sveltePlugin = hasEnabledPlugin(claudeSettings, 'svelte@svelte', cache);
		const mcp =
			hasJsonEntry(claudeSettings, 'mcpServers', 'dryui', cache) ||
			hasJsonEntry(join(ctx.cwd, '.mcp.json'), 'mcpServers', 'dryui', cache);
		const feedback =
			(plugin && hasClaudePluginServer(home, 'dryui@dryui', 'dryui-feedback', cache)) ||
			hasJsonEntry(claudeSettings, 'mcpServers', 'dryui-feedback', cache) ||
			hasJsonEntry(join(ctx.cwd, '.mcp.json'), 'mcpServers', 'dryui-feedback', cache);
		return {
			editor,
			dryui: plugin || mcp,
			feedback,
			svelte:
				hasJsonEntry(claudeSettings, 'mcpServers', 'svelte', cache) ||
				(plugin && hasClaudePluginServer(home, 'dryui@dryui', 'svelte', cache)) ||
				(sveltePlugin && hasClaudePluginServer(home, 'svelte@svelte', 'svelte', cache)),
			source: deriveSource(plugin, mcp)
		};
	}

	if (editor === 'codex') {
		const codexConfig = join(home, '.codex/config.toml');
		const plugin = hasTomlSection(codexConfig, 'plugins."dryui@dryui"', cache);
		const mcp = hasTomlSection(codexConfig, 'mcp_servers.dryui', cache);
		const pluginMcpManifest = join(home, '.codex/.tmp/marketplaces/dryui/.mcp.json');
		return {
			editor,
			dryui: plugin || mcp,
			feedback:
				hasTomlSection(codexConfig, 'mcp_servers."dryui-feedback"', cache) ||
				(plugin && hasJsonEntry(pluginMcpManifest, 'mcpServers', 'dryui-feedback', cache)),
			svelte:
				hasTomlSection(codexConfig, 'mcp_servers.svelte', cache) ||
				(plugin && hasJsonEntry(pluginMcpManifest, 'mcpServers', 'svelte', cache)),
			source: deriveSource(plugin, mcp)
		};
	}

	if (editor === 'copilot') {
		// Copilot CLI loads .mcp.json (workspace) and ~/.copilot/mcp-config.json (user).
		// VS Code's Copilot extension still reads .vscode/mcp.json with a `servers` key,
		// kept as a legacy fallback for pre-CLI-migration setups.
		const copilotSources = [
			[join(ctx.cwd, '.mcp.json'), 'mcpServers'],
			[join(home, '.copilot/mcp-config.json'), 'mcpServers'],
			[join(ctx.cwd, '.vscode/mcp.json'), 'servers']
		] as const;
		const hasAny = (name: string) =>
			copilotSources.some(([path, key]) => hasJsonEntry(path, key, name, cache));
		const mcp = hasAny('dryui');
		return {
			editor,
			dryui: mcp,
			feedback: hasAny('dryui-feedback'),
			svelte: hasAny('svelte'),
			source: mcp ? 'mcp' : 'none'
		};
	}

	if (editor === 'gemini') {
		const geminiSettings = join(home, '.gemini/settings.json');
		const pluginManifest = findGeminiExtensionManifest(home, 'dryui', cache);
		const plugin = pluginManifest !== null;
		const mcp = hasJsonEntry(geminiSettings, 'mcpServers', 'dryui', cache);
		const pluginHas = (name: string) =>
			pluginManifest !== null && hasJsonEntry(pluginManifest, 'mcpServers', name, cache);
		return {
			editor,
			dryui: plugin || mcp,
			feedback:
				pluginHas('dryui-feedback') ||
				hasJsonEntry(geminiSettings, 'mcpServers', 'dryui-feedback', cache),
			svelte: pluginHas('svelte') || hasJsonEntry(geminiSettings, 'mcpServers', 'svelte', cache),
			source: deriveSource(plugin, mcp)
		};
	}

	const config = EDITOR_MCP_CONFIG[editor];
	if (!config) {
		return { editor, dryui: false, feedback: false, svelte: false, source: 'none' };
	}
	const path = config.configPath(ctx);
	const mcp = hasJsonEntry(path, config.containerKey, 'dryui', cache);
	return {
		editor,
		dryui: mcp,
		feedback: hasJsonEntry(path, config.containerKey, 'dryui-feedback', cache),
		svelte: hasJsonEntry(path, config.containerKey, 'svelte', cache),
		source: mcp ? 'mcp' : 'none'
	};
}

function shortEditorName(editor: SetupGuideId): string {
	return editor === 'claude-code' ? 'claude' : editor;
}

function formatAgentSetupStatus(status: AgentSetupStatus): string {
	const sourceLabel = status.source === 'mixed' ? 'plugin + mcp' : status.source;
	const primary = status.dryui && !status.feedback ? `${sourceLabel} (no feedback)` : sourceLabel;
	const labels = [primary];
	if (status.svelte) labels.push('svelte');
	return `${shortEditorName(status.editor)} [${labels.join(' + ')}]`;
}

function probeSvelteInConfig(
	editor: SetupGuideId,
	config: EditorMcpConfig,
	ctx: InstallContext,
	cache: ProbeCache
): SvelteMcpRegistration {
	const configPath = config.configPath(ctx);
	const raw = readRawText(configPath, cache);
	if (raw === null || raw.trim() === '') {
		return { editor, configPath, status: 'missing' };
	}
	const parsed = readJsonObject(configPath, cache);
	if (!parsed) return { editor, configPath, status: 'invalid' };
	const container = parsed[config.containerKey];
	if (!container || typeof container !== 'object' || Array.isArray(container)) {
		return { editor, configPath, status: 'not-registered' };
	}
	const registered = 'svelte' in (container as Record<string, unknown>);
	return { editor, configPath, status: registered ? 'registered' : 'not-registered' };
}

export function readSvelteMcpRegistrations(ctx: InstallContext): readonly SvelteMcpRegistration[] {
	const cache = createProbeCache();
	const home = ctx.homeDir ?? homedir();
	const claudeSettings = join(home, '.claude/settings.json');
	const entries: SvelteMcpRegistration[] = [];

	for (const [editor, config] of Object.entries(EDITOR_MCP_CONFIG) as Array<
		[SetupGuideId, EditorMcpConfig]
	>) {
		entries.push(probeSvelteInConfig(editor, config, ctx, cache));
	}

	if (hasTomlSection(join(home, '.codex/config.toml'), 'mcp_servers.svelte', cache)) {
		entries.push({
			editor: 'codex',
			configPath: join(home, '.codex/config.toml'),
			status: 'registered'
		});
	}

	if (hasJsonEntry(claudeSettings, 'mcpServers', 'svelte', cache)) {
		entries.push({
			editor: 'claude-code',
			configPath: claudeSettings,
			status: 'registered'
		});
	} else if (
		(hasEnabledPlugin(claudeSettings, 'dryui@dryui', cache) &&
			hasClaudePluginServer(home, 'dryui@dryui', 'svelte', cache)) ||
		(hasEnabledPlugin(claudeSettings, 'svelte@svelte', cache) &&
			hasClaudePluginServer(home, 'svelte@svelte', 'svelte', cache))
	) {
		entries.push({
			editor: 'claude-code',
			configPath: join(home, '.claude/plugins/installed_plugins.json'),
			status: 'registered'
		});
	}
	return entries;
}

export function readAgentSetupStatuses(ctx: InstallContext): readonly AgentSetupStatus[] {
	const cache = createProbeCache();
	return [
		probeAgentSetup('claude-code', ctx, cache),
		probeAgentSetup('codex', ctx, cache),
		probeAgentSetup('gemini', ctx, cache),
		probeAgentSetup('opencode', ctx, cache),
		probeAgentSetup('copilot', ctx, cache),
		probeAgentSetup('cursor', ctx, cache),
		probeAgentSetup('windsurf', ctx, cache),
		probeAgentSetup('zed', ctx, cache)
	];
}

export function getAgentSetupStatus(editor: SetupGuideId, ctx: InstallContext): AgentSetupStatus {
	return probeAgentSetup(editor, ctx, createProbeCache());
}

export function summarizeAgentSetupStatus(ctx: InstallContext): string {
	const configured = readAgentSetupStatuses(ctx).filter((status) => status.dryui);
	if (configured.length === 0) return 'agents: none wired yet';
	return `agents: ${configured.map(formatAgentSetupStatus).join(', ')}`;
}

export function readAgentSetupEntries(ctx: InstallContext): readonly AgentSetupEntry[] {
	return readAgentSetupStatuses(ctx)
		.filter((status) => status.dryui)
		.map((status) => ({
			editor: status.editor,
			displayName: shortEditorName(status.editor),
			plugin: status.source === 'plugin' || status.source === 'mixed',
			mcp: status.source === 'mcp' || status.source === 'mixed',
			feedback: status.feedback,
			svelte: status.svelte
		}));
}

export function summarizeSvelteMcpStatus(ctx: InstallContext): string {
	const registrations = readSvelteMcpRegistrations(ctx);
	const registered = registrations.filter((entry) => entry.status === 'registered');
	if (registered.length === 0) return 'svelte-mcp: not registered in any wired editor';
	const names = registered.map((entry) => shortEditorName(entry.editor)).join(', ');
	return `svelte-mcp: registered for ${names}`;
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
		lines.push('Restart your editor or start a new session to pick up the new plugin/MCP config.');
	}
	return lines.join('\n');
}
