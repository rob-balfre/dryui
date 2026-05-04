import { aiSurface } from '../../../../packages/mcp/src/ai-surface.js';
import type { AgentId } from '../../../../packages/mcp/src/docs-surface.js';

type AiAgentId = AgentId;

interface AiSurfaceCard {
	readonly name: string;
	readonly description: string;
	readonly color: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
	readonly example?: string;
}

interface AiInstallStep {
	title: string;
	description?: string;
	code?: string;
	language?: string;
}

interface AiAgentSetup {
	id: AiAgentId;
	label: string;
	description: string;
	/** One-command setup (e.g. `claude mcp add dryui ...`). Shown prominently. */
	quickSetup?: {
		title: string;
		code: string;
	};
	/**
	 * Ordered steps for the plugin install. When present, the getting-started
	 * page renders these as a Timeline instead of a single code block.
	 */
	installSteps?: AiInstallStep[];
	skill?: {
		title: string;
		note: string;
		code: string;
	};
	mcp: {
		path: string;
		note: string;
		code: string;
		language: string;
	};
	companionMcp?: {
		title: string;
		note: string;
		code: string;
		language: string;
	};
	followUp: string;
}

const CLI_INSTALL_CODE = `target="$(readlink ~/.bun/install/global/node_modules/@dryui/cli 2>/dev/null || true)"
case "$target" in
  */packages/cli) DRYUI_DEV=1 dryui ;;
  *) bun install -g @dryui/cli@latest && dryui ;;
esac

# npm alternative
target="$(readlink ~/.bun/install/global/node_modules/@dryui/cli 2>/dev/null || true)"
case "$target" in
  */packages/cli) DRYUI_DEV=1 dryui ;;
  *) npm install -g @dryui/cli@latest && dryui ;;
esac`;

export const DRYUI_SKILLS_INSTALL_COMMAND = 'npx skills add rob-balfre/dryui';

const MCP_TOOL_COLORS: Readonly<Record<string, AiSurfaceCard['color']>> = {
	ask: 'orange',
	check: 'blue'
};

const CLI_COMMAND_COLORS: Readonly<Record<string, AiSurfaceCard['color']>> = {
	setup: 'green',
	init: 'blue',
	detect: 'blue',
	install: 'green',
	add: 'green',
	ask: 'blue',
	info: 'blue',
	list: 'purple',
	compose: 'orange',
	tokens: 'purple',
	check: 'blue',
	ambient: 'gray',
	'install-hook': 'gray',
	feedback: 'green'
};

const CLI_COMMAND_EXAMPLES: Readonly<Record<string, string>> = {
	setup: 'dryui setup',
	init: 'dryui init',
	detect: 'dryui detect .',
	install: 'dryui install .',
	add: 'dryui add --project --target src/routes/+page.svelte Button',
	ask: 'dryui ask --scope component Button',
	info: 'dryui info button',
	list: 'dryui list --category layout',
	compose: 'dryui compose "date input"',
	tokens: 'dryui tokens --category color',
	check: 'dryui check src/routes/+page.svelte',
	ambient: 'dryui ambient',
	'install-hook': 'dryui install-hook --dry-run',
	feedback: 'dryui feedback ui --no-open'
};

const dryuiMcpTools: readonly AiSurfaceCard[] = aiSurface.tools.map((tool) => ({
	name: tool.name,
	description: tool.description,
	color: MCP_TOOL_COLORS[tool.name] ?? 'gray'
}));

export const dryuiCliCommands: readonly AiSurfaceCard[] = aiSurface.cliCommands.map((command) => ({
	name: command.name,
	description: command.description,
	color: CLI_COMMAND_COLORS[command.name] ?? 'gray',
	...(CLI_COMMAND_EXAMPLES[command.name] ? { example: CLI_COMMAND_EXAMPLES[command.name] } : {})
}));

// ── MCP config snippets per tool ──

// Claude Code, Cursor, and Windsurf all use the same mcpServers JSON format
const mcpServersConfig = `{
  "mcpServers": {
    "dryui": {
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    }
  }
}`;

const codexConfig = `[mcp_servers.dryui]
command = "npx"
args = ["-y", "@dryui/mcp"]

[mcp_servers.dryui-feedback]
command = "npx"
args = ["-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]`;

// Copilot CLI (1.x+) reads `.mcp.json` at the project root (workspace) and
// `~/.copilot/mcp-config.json` (user) — both use the `mcpServers` root key, same
// shape as Claude Code's .mcp.json. Support for .vscode/mcp.json was removed in
// Copilot CLI 1.x; see `copilot --help` banner and https://gh.io/copilotcli-mcpmigrate.
// The feedback server needs the `sh -c 'cd ${TMPDIR} && exec npx ...'` wrapper because
// `npx -p <workspace-pkg> <bin>` fails inside Bun workspaces (cwd shadow).
const copilotCliConfig = `{
  "mcpServers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    },
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

// VS Code Copilot (extension) uses the `servers` root key in .vscode/mcp.json.
const copilotVscodeConfig = `{
  "servers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    },
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

const geminiConfig = `{
  "mcpServers": {
    "dryui": {
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    },
    "dryui-feedback": {
      "command": "npx",
      "args": ["-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]
    }
  }
}`;

const opencodeConfig = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "dryui": {
      "type": "local",
      "command": ["npx", "-y", "@dryui/mcp"]
    },
    "dryui-feedback": {
      "type": "local",
      "command": ["npx", "-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]
    }
  }
}`;

const zedConfig = `{
  "context_servers": {
    "dryui": {
      "command": {
        "path": "npx",
        "args": ["-y", "@dryui/mcp"]
      }
    }
  }
}`;

const companionSvelteNote =
	'Run `dryui setup --editor <agent>` to print the recommended Svelte MCP companion snippet for your editor. For Claude Code, Codex, and Gemini, use the snippet below.';

const svelteCompanionClaude = `claude plugin marketplace add sveltejs/ai-tools
claude plugin install svelte@svelte

# MCP-only fallback
claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`;

const svelteCompanionCodex = `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]`;

const svelteCompanionGemini = 'gemini mcp add -t stdio -s user svelte npx -y @sveltejs/mcp';

const svelteCompanionMcpServers = `{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}`;

const svelteCompanionOpencode = `{
  "mcp": {
    "svelte": {
      "type": "local",
      "command": ["npx", "-y", "@sveltejs/mcp"]
    }
  }
}`;

// Copilot CLI format (~/.copilot/mcp-config.json uses `mcpServers`).
const svelteCompanionCopilotCli = `{
  "mcpServers": {
    "svelte": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}`;

// VS Code Copilot extension format (.vscode/mcp.json uses `servers`).
const svelteCompanionCopilotVscode = `{
  "servers": {
    "svelte": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}`;

const svelteCompanionZed = `{
  "context_servers": {
    "svelte": {
      "command": {
        "path": "npx",
        "args": ["-y", "@sveltejs/mcp"]
      }
    }
  }
}`;

// ── Agent setup definitions ──

export const aiAgentSetups: AiAgentSetup[] = [
	{
		id: 'claude-code',
		label: 'Claude Code',
		description:
			'Start with the DryUI CLI, then install the DryUI skills and add the MCP servers so Claude can use the same discovery and validation loop in-editor.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		installSteps: [
			{
				title: 'Install the DryUI skills',
				description: 'Uses the upstream npx skills CLI (skills.sh standard).',
				code: DRYUI_SKILLS_INSTALL_COMMAND
			},
			{
				title: 'Add the MCP servers',
				description: 'Adds MCP `ask`/`check` and the feedback MCP server to Claude Code.',
				code: `claude mcp add dryui -- npx -y @dryui/mcp
claude mcp add dryui-feedback -- npx -y -p @dryui/feedback-server dryui-feedback-mcp`
			}
		],
		skill: {
			title: '2. Install the DryUI skills',
			note: 'The npx skills command is the canonical Claude install path for DryUI skills.',
			code: DRYUI_SKILLS_INSTALL_COMMAND
		},
		mcp: {
			path: '.mcp.json',
			note: '3. Add the MCP servers so Claude can call MCP `ask`/`check` and feedback tools.',
			code: `# MCP server
claude mcp add dryui -- npx -y @dryui/mcp
claude mcp add dryui-feedback -- npx -y -p @dryui/feedback-server dryui-feedback-mcp`,
			language: 'bash'
		},
		companionMcp: {
			title: 'Svelte companion (recommended)',
			note: 'Prefer the official Claude Svelte plugin. If you cannot use plugins, the MCP-only fallback below still adds list-sections, get-documentation, svelte-autofixer, and playground-link so the agent can ground Svelte 5 and SvelteKit answers in the official docs.',
			code: svelteCompanionClaude,
			language: 'bash'
		},
		followUp:
			'Use the CLI as the default surface. The skill adds conventions; MCP adds `ask`/`check` inside Claude.'
	},
	{
		id: 'codex',
		label: 'Codex',
		description:
			'Start with the DryUI CLI, then install the DryUI skills and add the MCP servers so Codex can use the same discovery and validation loop in-editor.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		installSteps: [
			{
				title: 'Install the DryUI skills',
				description: 'Uses the upstream npx skills CLI (skills.sh standard).',
				code: DRYUI_SKILLS_INSTALL_COMMAND
			},
			{
				title: 'Add the MCP servers',
				description: 'Append the dryui and dryui-feedback servers to Codex config.',
				code: codexConfig,
				language: 'toml'
			}
		],
		skill: {
			title: '2. Install the DryUI skills',
			note: 'The npx skills command is the canonical Codex install path for DryUI skills.',
			code: DRYUI_SKILLS_INSTALL_COMMAND
		},
		mcp: {
			path: '.codex/config.toml',
			note: '3. Optional MCP-only fallback: add the servers manually if you cannot use plugins. This does not install the bundled DryUI skill.',
			code: codexConfig,
			language: 'toml'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} Append this block to \`~/.codex/config.toml\`.`,
			code: svelteCompanionCodex,
			language: 'toml'
		},
		followUp:
			'Use the CLI as the default surface. After installing the plugin, start a fresh Codex session so MCP `ask` and `check` are available.'
	},
	{
		id: 'gemini',
		label: 'Gemini CLI',
		description:
			'Start with the DryUI CLI, then install the DryUI extension so Gemini can use the same discovery and validation loop in-editor.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		installSteps: [
			{
				title: 'Install the DryUI skill',
				description:
					'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .gemini/skills/dryui`.',
				code: 'npx skills add rob-balfre/dryui --agent gemini-cli',
				language: 'bash'
			},
			{
				title: 'Add the MCP servers',
				description:
					'`dryui init` (or `dryui setup --editor gemini`) merges both dryui and dryui-feedback MCP servers into `~/.gemini/settings.json` automatically.',
				code: geminiConfig,
				language: 'json'
			}
		],
		skill: {
			title: '2. Install the skill',
			note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .gemini/skills/dryui`.',
			code: `npx skills add rob-balfre/dryui --agent gemini-cli`
		},
		mcp: {
			path: '~/.gemini/settings.json',
			note: '3. Add the dryui and dryui-feedback MCP servers. `dryui init` (or `dryui setup --editor gemini`) does this automatically.',
			code: geminiConfig,
			language: 'json'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} Run this once to register the server for Gemini CLI.`,
			code: svelteCompanionGemini,
			language: 'bash'
		},
		followUp:
			'Use the CLI as the default surface. After installing the extension, restart Gemini so MCP `ask` and `check` are available.'
	},
	{
		id: 'opencode',
		label: 'OpenCode',
		description:
			"Start with the DryUI CLI, then use OpenCode's native skill and MCP setup so it can follow DryUI conventions and call the same discovery and validation tools in-editor.",
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		installSteps: [
			{
				title: 'Install the DryUI skill',
				description:
					'Uses the upstream `npx skills` CLI (skills.sh standard) to fan out the install. Falls through to `npx degit rob-balfre/dryui/skills/dryui .opencode/skills/dryui` if you want to pin the install path.',
				code: 'npx skills add rob-balfre/dryui --agent opencode',
				language: 'bash'
			},
			{
				title: 'Add the MCP servers',
				description:
					'Put this in `opencode.json` at your project root so OpenCode can start the dryui and dryui-feedback servers locally.',
				code: opencodeConfig,
				language: 'json'
			}
		],
		skill: {
			title: '2. Install the skill',
			note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .opencode/skills/dryui`.',
			code: `npx skills add rob-balfre/dryui --agent opencode`
		},
		mcp: {
			path: 'opencode.json',
			note: '3. Add the MCP servers to `opencode.json`. OpenCode expects local MCP servers under the `mcp` object with `type: "local"` and command arrays.',
			code: opencodeConfig,
			language: 'json'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} Adds a third entry under the \`mcp\` object in \`opencode.json\`.`,
			code: svelteCompanionOpencode,
			language: 'json'
		},
		followUp:
			'Use the CLI as the default surface. OpenCode also reads `AGENTS.md` and `.agents/skills/` compatibility paths. Restart OpenCode after adding the skill and `opencode.json`.'
	},
	{
		id: 'copilot',
		label: 'Copilot',
		description:
			'Start with the DryUI CLI, then copy the DryUI skill into the repo and add the MCP servers. Copilot CLI (1.x+) reads `.mcp.json` at the project root with root key `mcpServers` (same shape as Claude Code). `~/.copilot/mcp-config.json` provides user-level defaults. The VS Code Copilot extension still reads `.vscode/mcp.json` with root key `servers` — configure that separately if you use both surfaces.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		installSteps: [
			{
				title: 'Install the DryUI skill',
				description:
					'Uses the upstream `npx skills` CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .github/skills/dryui`.',
				code: 'npx skills add rob-balfre/dryui --agent github-copilot',
				language: 'bash'
			},
			{
				title: 'Add the MCP servers (Copilot CLI)',
				description:
					'Copilot CLI reads `.mcp.json` at the project root (workspace) and `~/.copilot/mcp-config.json` (user). Root key is `mcpServers`, same as Claude Code — the two tools share the file. Support for `.vscode/mcp.json` was removed in Copilot CLI 1.x.',
				code: copilotCliConfig,
				language: 'json'
			},
			{
				title: 'Add the MCP servers (VS Code Copilot)',
				description:
					'If you also use the VS Code Copilot extension (Agent mode), put this in `.vscode/mcp.json` at the project root. Root key is `servers`, not `mcpServers`.',
				code: copilotVscodeConfig,
				language: 'json'
			}
		],
		skill: {
			title: '2. Install the skill',
			note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .github/skills/dryui`.',
			code: `npx skills add rob-balfre/dryui --agent github-copilot`
		},
		mcp: {
			path: '.mcp.json',
			note: '3. Add the MCP servers for Copilot CLI at `.mcp.json` (project root, shared with Claude Code). Root key is `mcpServers`. For user-level defaults, use `~/.copilot/mcp-config.json` with the same shape. If you also use the VS Code Copilot extension, mirror this into `.vscode/mcp.json` but rename the root key to `servers`.',
			code: copilotCliConfig,
			language: 'json'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} For Copilot CLI, add this under \`mcpServers\` in \`.mcp.json\` (or \`~/.copilot/mcp-config.json\`). For VS Code Copilot, add the equivalent block under \`servers\` in \`.vscode/mcp.json\`.`,
			code: svelteCompanionCopilotCli,
			language: 'json'
		},
		followUp:
			'Use the CLI as the default surface. Copilot CLI picks up MCP servers from `.mcp.json` (workspace) and `~/.copilot/mcp-config.json` (user) on launch. In the VS Code extension, MCP tools only work in Agent mode, and the skill loads automatically when relevant.'
	},
	{
		id: 'cursor',
		label: 'Cursor',
		description:
			'Start with the DryUI CLI, then copy the DryUI skill into the repo and add the MCP server for in-editor lookup and validation.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		skill: {
			title: '2. Install the skill',
			note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .agents/skills/dryui`.',
			code: `npx skills add rob-balfre/dryui --agent cursor`
		},
		mcp: {
			path: '.cursor/mcp.json',
			note: '3. Add the MCP server to `.cursor/mcp.json`.',
			code: mcpServersConfig,
			language: 'json'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} Adds a sibling entry under \`mcpServers\` in \`.cursor/mcp.json\`.`,
			code: svelteCompanionMcpServers,
			language: 'json'
		},
		followUp:
			'Use the CLI as the default surface. The skill loads automatically when Cursor determines DryUI is relevant to the task.'
	},
	{
		id: 'windsurf',
		label: 'Windsurf',
		description:
			'Start with the DryUI CLI, then copy the DryUI skill into the repo and add the MCP server for in-editor lookup and validation.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		skill: {
			title: '2. Install the skill',
			note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .agents/skills/dryui`.',
			code: `npx skills add rob-balfre/dryui --agent windsurf`
		},
		mcp: {
			path: '~/.codeium/windsurf/mcp_config.json',
			note: '3. Add the MCP server to `~/.codeium/windsurf/mcp_config.json`.',
			code: mcpServersConfig,
			language: 'json'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} Adds a sibling entry under \`mcpServers\` in \`~/.codeium/windsurf/mcp_config.json\`.`,
			code: svelteCompanionMcpServers,
			language: 'json'
		},
		followUp:
			'Use the CLI as the default surface. Windsurf has a 100-tool limit across all MCP servers; DryUI uses 3 tools and @sveltejs/mcp adds 4.'
	},
	{
		id: 'zed',
		label: 'Zed',
		description:
			'Start with the DryUI CLI. Zed does not yet support Agent Skills, so use AGENTS.md for conventions and add the MCP server for tools.',
		quickSetup: {
			title: '1. Install the CLI',
			code: CLI_INSTALL_CODE
		},
		mcp: {
			path: '~/.config/zed/settings.json',
			note: '2. Add the MCP server to `~/.config/zed/settings.json`. AGENTS.md at the repo root provides conventions automatically.',
			code: zedConfig,
			language: 'json'
		},
		companionMcp: {
			title: 'Svelte MCP (recommended companion)',
			note: `${companionSvelteNote} Adds a sibling entry under \`context_servers\` in \`~/.config/zed/settings.json\`.`,
			code: svelteCompanionZed,
			language: 'json'
		},
		followUp:
			'Use the CLI as the default surface. Zed reads AGENTS.md automatically. Verify MCP in the Agent Panel (Cmd+Shift+A) — green indicator means active.'
	}
];
