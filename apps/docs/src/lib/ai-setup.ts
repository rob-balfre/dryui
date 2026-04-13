import { aiSurface } from '../../../../packages/mcp/src/ai-surface.js';

export type AiAgentId = 'claude-code' | 'codex' | 'cursor' | 'copilot' | 'windsurf' | 'zed';

export interface AiSurfaceCard {
	readonly name: string;
	readonly description: string;
	readonly color: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
	readonly example?: string;
}

export interface AiAgentSetup {
	id: AiAgentId;
	label: string;
	description: string;
	/** One-command setup (e.g. `claude mcp add dryui ...`). Shown prominently. */
	quickSetup?: {
		title: string;
		code: string;
	};
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
	followUp: string;
}

const MCP_TOOL_COLORS: Readonly<Record<string, AiSurfaceCard['color']>> = {
	info: 'blue',
	get: 'orange',
	list: 'purple',
	compose: 'orange',
	review: 'blue',
	diagnose: 'green',
	detect_project: 'blue',
	plan_install: 'green',
	plan_add: 'orange',
	doctor: 'blue',
	lint: 'purple'
};

const CLI_COMMAND_COLORS: Readonly<Record<string, AiSurfaceCard['color']>> = {
	init: 'blue',
	detect: 'blue',
	install: 'green',
	add: 'green',
	get: 'orange',
	info: 'blue',
	list: 'purple',
	compose: 'orange',
	review: 'blue',
	diagnose: 'green',
	doctor: 'blue',
	lint: 'purple'
};

const CLI_COMMAND_EXAMPLES: Readonly<Record<string, string>> = {
	init: 'dryui init',
	detect: 'dryui detect .',
	install: 'dryui install .',
	add: 'dryui add --project --target src/routes/+page.svelte Card',
	get: 'dryui get "Checkout Forms"',
	info: 'dryui info card',
	list: 'dryui list --category layout',
	compose: 'dryui compose "date input"',
	review: 'dryui review src/routes/+page.svelte',
	diagnose: 'dryui diagnose src/app.css',
	doctor: 'dryui doctor --changed',
	lint: 'dryui lint --max-severity warning'
};

export const dryuiMcpTools: readonly AiSurfaceCard[] = aiSurface.tools.map((tool) => ({
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
args = ["-y", "@dryui/mcp"]`;

const copilotConfig = `{
  "servers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
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

// ── Agent setup definitions ──

export const aiAgentSetups: AiAgentSetup[] = [
	{
		id: 'claude-code',
		label: 'Claude Code',
		description:
			'Install the DryUI plugin to get the skill (conventions) and MCP server (live tools) in one step.',
		quickSetup: {
			title: 'Install the plugin (skill + MCP server)',
			code: `claude plugin marketplace add rob-balfre/dryui
claude plugin install dryui@dryui`
		},
		mcp: {
			path: '.mcp.json',
			note: 'Or set up manually: add the MCP server and copy the skill.',
			code: `# MCP server
claude mcp add dryui -- npx -y @dryui/mcp

# Skill (copy to .claude/skills/ or .agents/skills/)
git clone --depth 1 --filter=blob:none --sparse https://github.com/rob-balfre/dryui.git /tmp/dryui
cd /tmp/dryui && git sparse-checkout set packages/ui/skills/dryui
mkdir -p .claude/skills && cp -r /tmp/dryui/packages/ui/skills/dryui .claude/skills/`,
			language: 'bash'
		},
		followUp:
			'The skill teaches conventions, the MCP server provides live API lookup and code validation. The plugin installs both.'
	},
	{
		id: 'codex',
		label: 'Codex',
		description:
			'Install the DryUI skill from GitHub. It includes an MCP server dependency that Codex wires automatically.',
		skill: {
			title: '1. Install the skill',
			note: 'The $skill-installer downloads the skill and its MCP dependency declaration.',
			code: '$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui'
		},
		quickSetup: {
			title: '2. Add the MCP server',
			code: 'codex mcp add dryui -- npx -y @dryui/mcp'
		},
		mcp: {
			path: '.codex/config.toml',
			note: 'Or add the MCP config manually to .codex/config.toml.',
			code: codexConfig,
			language: 'toml'
		},
		followUp:
			'Restart Codex after installation. The skill teaches conventions, the MCP server provides live tools.'
	},
	{
		id: 'copilot',
		label: 'VS Code / Copilot',
		description:
			'Copilot supports Agent Skills. Copy the DryUI skill to your project and add the MCP server.',
		skill: {
			title: '1. Install the skill',
			note: 'Copy the DryUI skill to .github/skills/ (Copilot standard) or .agents/skills/ (cross-tool).',
			code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .github/skills/dryui`
		},
		mcp: {
			path: '.vscode/mcp.json',
			note: '2. Add the MCP server to .vscode/mcp.json. Note: root key is "servers", not "mcpServers".',
			code: copilotConfig,
			language: 'json'
		},
		followUp:
			'MCP tools only work in Copilot Agent mode. The skill loads automatically when relevant.'
	},
	{
		id: 'cursor',
		label: 'Cursor',
		description:
			'Cursor supports Agent Skills. Copy the DryUI skill to your project and add the MCP server.',
		skill: {
			title: '1. Install the skill',
			note: 'Copy the DryUI skill to .cursor/skills/ or .agents/skills/.',
			code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui`
		},
		mcp: {
			path: '.cursor/mcp.json',
			note: '2. Add the MCP server to .cursor/mcp.json.',
			code: mcpServersConfig,
			language: 'json'
		},
		followUp: 'The skill loads automatically when Cursor determines DryUI is relevant to the task.'
	},
	{
		id: 'windsurf',
		label: 'Windsurf',
		description:
			'Windsurf supports Agent Skills. Copy the DryUI skill to your project and add the MCP server.',
		skill: {
			title: '1. Install the skill',
			note: 'Copy the DryUI skill to .agents/skills/.',
			code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui`
		},
		mcp: {
			path: '~/.codeium/windsurf/mcp_config.json',
			note: '2. Add the MCP server to ~/.codeium/windsurf/mcp_config.json.',
			code: mcpServersConfig,
			language: 'json'
		},
		followUp: 'Windsurf has a 100-tool limit across all MCP servers. DryUI uses 11 tools.'
	},
	{
		id: 'zed',
		label: 'Zed',
		description:
			'Zed does not yet support Agent Skills. Use AGENTS.md for conventions and add the MCP server for tools.',
		mcp: {
			path: '~/.config/zed/settings.json',
			note: 'Add the MCP server to ~/.config/zed/settings.json. AGENTS.md at the repo root provides conventions automatically.',
			code: zedConfig,
			language: 'json'
		},
		followUp:
			'Zed reads AGENTS.md automatically. Verify MCP in the Agent Panel (Cmd+Shift+A) — green indicator means active.'
	}
];
