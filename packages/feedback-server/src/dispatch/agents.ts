// Static catalogue of dispatch agents.
//
// Each agent picks one of four launch strategies (see ./strategies.ts).
// Per-strategy data lives directly on the row so adding a tenth agent is a
// matter of choosing a strategy and filling its fields.
//
// Strategies (functions) live in ./strategies.ts. This file is data only —
// strings, paths, and a strategy tag.

import type { SubmissionAgent } from '../types.js';

export type DispatchAgent = Exclude<SubmissionAgent, 'off'>;
export type DefaultDispatchAgent = DispatchAgent | 'off';
export type DispatchSkillPaths = Partial<Record<DispatchAgent, string>>;
export type DispatchDocsAgentId =
	| 'claude-code'
	| 'codex'
	| 'gemini'
	| 'opencode'
	| 'copilot'
	| 'cursor'
	| 'windsurf'
	| 'zed';

/** Strategy tags. Each maps to one launch implementation in ./strategies.ts. */
export type LaunchStrategyId =
	| 'terminal-cli'
	| 'deeplink'
	| 'workspace-app-cli-chat'
	| 'workspace-app-clipboard';

/**
 * One JSON-config probe entry. The probe matches if `entryKey` exists under
 * `rootKey` in the file at `pathTemplate` (with `{workspace}` / `{home}`
 * substitution). Multiple entries on an agent are OR'd.
 */
export interface McpConfigProbe {
	pathTemplate: string;
	rootKey: string;
	entryKey: string;
}

/**
 * Optional warning fired on dispatch (not probe). If the path/entry is
 * missing, we tell the user how to add it. Today only Copilot CLI and the
 * VS Code Copilot extension carry one — they need an MCP entry to reach the
 * feedback server.
 */
export interface DispatchConfigWarning {
	pathTemplate: string;
	rootKey: string;
	/** The key the warning checks for and instructs the user to add. */
	entryKey: string;
	readerLabel: string;
	snippet: string;
}

interface BaseAgent<S extends LaunchStrategyId> {
	id: DispatchAgent;
	label: string;
	shortLabel: string;
	/** Docs setup card id, when this dispatch row owns a first-party docs surface. */
	docsId?: DispatchDocsAgentId;
	strategy: S;
	/** PATH binary to look up. Optional for agents discovered only via Mac app or bundled CLI. */
	cliCommand?: string;
	/** Mac .app names (in /Applications and ~/Applications) that count as installed. */
	macApps?: readonly string[];
	/** JSON probes; any match counts as configured. */
	mcpConfigProbes?: readonly McpConfigProbe[];
	/** Specialised CLI lookup (vscode/windsurf bundled paths inside .app). */
	bundledCli?: 'vscode' | 'windsurf';
	/** Warning fired during dispatch when the MCP entry is missing. */
	dispatchWarning?: DispatchConfigWarning;
}

export interface TerminalCliAgent extends BaseAgent<'terminal-cli'> {
	cliCommand: string;
	/** Base CLI invocation (command + flags). The prompt is appended at dispatch time. */
	cliArgs: readonly string[];
}

export interface DeeplinkAgent extends BaseAgent<'deeplink'> {
	cliCommand: string;
	macApps: readonly string[];
	/** Optional prefix prepended to the prompt before URL-encoding. */
	promptPrefix?: string;
	/** URL scheme + path; `{prompt}` and `{workspace}` are substituted (URL-encoded). */
	urlTemplate: string;
}

export interface WorkspaceAppCliChatAgent extends BaseAgent<'workspace-app-cli-chat'> {
	macApps: readonly string[];
	mcpConfigProbes: readonly McpConfigProbe[];
}

export interface WorkspaceAppClipboardAgent extends BaseAgent<'workspace-app-clipboard'> {
	cliCommand: string;
	macApps: readonly string[];
	mcpConfigProbes: readonly McpConfigProbe[];
}

export type AgentConfig =
	| TerminalCliAgent
	| DeeplinkAgent
	| WorkspaceAppCliChatAgent
	| WorkspaceAppClipboardAgent;

export interface DispatchAgentDisplayInfo {
	id: DispatchAgent;
	label: string;
	shortLabel: string;
	docsId?: DispatchDocsAgentId;
}

const COPILOT_CONFIG_SNIPPET = `{
  "mcpServers": {
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

const COPILOT_VSCODE_CONFIG_SNIPPET = `{
  "servers": {
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

/**
 * Catalogue, keyed by agent id. Editing this table is how new agents are
 * added; the strategy modules read it at runtime.
 */
export const AGENTS: Record<DispatchAgent, AgentConfig> = {
	claude: {
		id: 'claude',
		label: 'Claude Code',
		shortLabel: 'Claude',
		docsId: 'claude-code',
		strategy: 'terminal-cli',
		cliCommand: 'claude',
		// Pin every dispatched claude session to the `feedback` subagent so the
		// canonical skill is loaded before the first edit. Model/permission/
		// effort flags are appended at dispatch time (see ./strategies.ts).
		cliArgs: ['claude', '--agent', 'feedback']
	},
	codex: {
		id: 'codex',
		label: 'Codex',
		shortLabel: 'Codex',
		docsId: 'codex',
		strategy: 'deeplink',
		cliCommand: 'codex',
		macApps: ['Codex'],
		urlTemplate: 'codex://new?prompt={prompt}&path={workspace}'
	},
	gemini: {
		id: 'gemini',
		label: 'Gemini CLI',
		shortLabel: 'Gemini',
		docsId: 'gemini',
		strategy: 'terminal-cli',
		cliCommand: 'gemini',
		cliArgs: ['gemini']
	},
	opencode: {
		id: 'opencode',
		label: 'OpenCode',
		shortLabel: 'OpenCode',
		docsId: 'opencode',
		strategy: 'terminal-cli',
		cliCommand: 'opencode',
		// opencode takes the workspace as a positional and the prompt via
		// --prompt; the strategy assembles the final command form.
		cliArgs: ['opencode'],
		mcpConfigProbes: [
			{ pathTemplate: '{workspace}/opencode.json', rootKey: 'mcp', entryKey: 'dryui-feedback' },
			{ pathTemplate: '{workspace}/opencode.json', rootKey: 'mcp', entryKey: 'dryui' }
		]
	},
	copilot: {
		id: 'copilot',
		label: 'Copilot CLI',
		shortLabel: 'Copilot CLI',
		docsId: 'copilot',
		strategy: 'terminal-cli',
		cliCommand: 'copilot',
		cliArgs: ['copilot', '-i'],
		mcpConfigProbes: [
			{
				pathTemplate: '{home}/.copilot/mcp-config.json',
				rootKey: 'mcpServers',
				entryKey: 'dryui-feedback'
			}
		],
		dispatchWarning: {
			pathTemplate: '{home}/.copilot/mcp-config.json',
			rootKey: 'mcpServers',
			entryKey: 'dryui-feedback',
			readerLabel: 'Copilot CLI',
			snippet: COPILOT_CONFIG_SNIPPET
		}
	},
	'copilot-vscode': {
		id: 'copilot-vscode',
		label: 'Copilot VS Code',
		shortLabel: 'Copilot VS',
		strategy: 'workspace-app-cli-chat',
		bundledCli: 'vscode',
		macApps: ['Visual Studio Code', 'Visual Studio Code - Insiders'],
		mcpConfigProbes: [
			{
				pathTemplate: '{workspace}/.vscode/mcp.json',
				rootKey: 'servers',
				entryKey: 'dryui-feedback'
			},
			{
				pathTemplate: '{workspace}/.vscode/mcp.json',
				rootKey: 'servers',
				entryKey: 'dryui'
			}
		],
		dispatchWarning: {
			pathTemplate: '{workspace}/.vscode/mcp.json',
			rootKey: 'servers',
			entryKey: 'dryui-feedback',
			readerLabel: 'VS Code Copilot',
			snippet: COPILOT_VSCODE_CONFIG_SNIPPET
		}
	},
	cursor: {
		id: 'cursor',
		label: 'Cursor',
		shortLabel: 'Cursor',
		docsId: 'cursor',
		strategy: 'workspace-app-clipboard',
		cliCommand: 'cursor',
		macApps: ['Cursor'],
		mcpConfigProbes: [
			{
				pathTemplate: '{workspace}/.cursor/mcp.json',
				rootKey: 'mcpServers',
				entryKey: 'dryui-feedback'
			},
			{
				pathTemplate: '{workspace}/.cursor/mcp.json',
				rootKey: 'mcpServers',
				entryKey: 'dryui'
			}
		]
	},
	windsurf: {
		id: 'windsurf',
		label: 'Windsurf',
		shortLabel: 'Windsurf',
		docsId: 'windsurf',
		strategy: 'workspace-app-cli-chat',
		cliCommand: 'windsurf',
		bundledCli: 'windsurf',
		macApps: ['Windsurf'],
		mcpConfigProbes: [
			{
				pathTemplate: '{home}/.codeium/windsurf/mcp_config.json',
				rootKey: 'mcpServers',
				entryKey: 'dryui-feedback'
			},
			{
				pathTemplate: '{home}/.codeium/windsurf/mcp_config.json',
				rootKey: 'mcpServers',
				entryKey: 'dryui'
			}
		]
	},
	zed: {
		id: 'zed',
		label: 'Zed',
		shortLabel: 'Zed',
		docsId: 'zed',
		strategy: 'workspace-app-clipboard',
		cliCommand: 'zed',
		macApps: ['Zed'],
		mcpConfigProbes: [
			{
				pathTemplate: '{home}/.config/zed/settings.json',
				rootKey: 'context_servers',
				entryKey: 'dryui'
			}
		]
	}
};

export const DISPATCH_AGENTS: readonly DispatchAgent[] = Object.keys(AGENTS) as DispatchAgent[];

export const AGENT_DISPLAY_INFO: Readonly<Record<DispatchAgent, DispatchAgentDisplayInfo>> =
	Object.fromEntries(
		DISPATCH_AGENTS.map((id) => {
			const agent = AGENTS[id];
			return [
				id,
				{
					id,
					label: agent.label,
					shortLabel: agent.shortLabel,
					...(agent.docsId ? { docsId: agent.docsId } : {})
				}
			];
		})
	) as Readonly<Record<DispatchAgent, DispatchAgentDisplayInfo>>;

export const DISPATCH_DOCS_AGENT_IDS: readonly DispatchDocsAgentId[] = DISPATCH_AGENTS.flatMap(
	(id) => {
		const docsId = AGENTS[id].docsId;
		return docsId ? [docsId] : [];
	}
);

export type TerminalApp = 'terminal' | 'ghostty';
export const TERMINAL_APPS: readonly TerminalApp[] = ['terminal', 'ghostty'];

/** Resolve a path template; substitutes `{workspace}` and `{home}`. */
export function resolveAgentPath(template: string, workspace: string, homeDir: string): string {
	return template.replace('{workspace}', workspace).replace('{home}', homeDir);
}
