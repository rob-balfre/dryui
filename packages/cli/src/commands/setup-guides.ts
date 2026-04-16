export type SetupGuideId = 'claude-code' | 'codex' | 'copilot' | 'cursor' | 'windsurf' | 'zed';

export interface SetupGuideSection {
	title: string;
	note?: string;
	code: string;
}

export interface SetupGuide {
	id: SetupGuideId;
	label: string;
	description: string;
	sections: readonly SetupGuideSection[];
	followUp: string;
}

const MCP_SERVERS_CONFIG = `{
  "mcpServers": {
    "dryui": {
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    }
  }
}`;

const CODEX_CONFIG = `[mcp_servers.dryui]
command = "npx"
args = ["-y", "@dryui/mcp"]

[mcp_servers.dryui-feedback]
command = "npx"
args = ["-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]`;

const COPILOT_CONFIG = `{
  "servers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    }
  }
}`;

const ZED_CONFIG = `{
  "context_servers": {
    "dryui": {
      "command": {
        "path": "npx",
        "args": ["-y", "@dryui/mcp"]
      }
    }
  }
}`;

export const setupGuideIds: readonly SetupGuideId[] = [
	'claude-code',
	'codex',
	'copilot',
	'cursor',
	'windsurf',
	'zed'
];

export const setupGuides: readonly SetupGuide[] = [
	{
		id: 'claude-code',
		label: 'Claude Code',
		description:
			'Install the DryUI plugin for Claude. The plugin is the canonical Claude skill path.',
		sections: [
			{
				title: 'Install the plugin',
				note: 'The plugin bundles the DryUI skill plus the DryUI MCP servers for Claude.',
				code: `claude plugin marketplace add rob-balfre/dryui
claude plugin install dryui@dryui`
			},
			{
				title: 'Optional MCP-only fallback',
				note: 'Only use this if you cannot install plugins. It does not install the bundled DryUI skill.',
				code: `claude mcp add dryui -- npx -y @dryui/mcp
claude mcp add dryui-feedback -- npx -y -p @dryui/feedback-server dryui-feedback-mcp`
			},
			{
				title: 'Optional SessionStart hook',
				note: 'Inject `dryui ambient` into Claude Code sessions.',
				code: `dryui install-hook`
			}
		],
		followUp: 'Start a new Claude Code session after wiring the plugin or hook.'
	},
	{
		id: 'codex',
		label: 'Codex',
		description:
			'Install the DryUI plugin for Codex. The plugin is the canonical Codex skill path.',
		sections: [
			{
				title: 'Install the plugin',
				note: 'Requires Codex 0.121.0 or newer. Run the command below, then start `codex`, run `/plugins`, and install `DryUI`. The plugin bundles the DryUI skill plus the DryUI MCP servers.',
				code: `codex marketplace add rob-balfre/dryui`
			},
			{
				title: 'Optional MCP-only fallback',
				note: 'Only use this if you cannot install plugins. It does not install the bundled DryUI skill.',
				code: `codex mcp add dryui -- npx -y @dryui/mcp
codex mcp add dryui-feedback -- npx -y -p @dryui/feedback-server dryui-feedback-mcp

# .codex/config.toml
${CODEX_CONFIG}`
			}
		],
		followUp:
			'After installing the plugin, start a new Codex session so `ask` / `check` are available.'
	},
	{
		id: 'copilot',
		label: 'VS Code / Copilot',
		description:
			'Copy the DryUI skill into the repo and add the MCP server for Copilot Agent mode.',
		sections: [
			{
				title: 'Install the skill',
				note: 'Copy to `.github/skills/` for Copilot, or `.agents/skills/` for a cross-tool folder.',
				code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .github/skills/dryui`
			},
			{
				title: 'Add the MCP server',
				note: 'Copilot uses `servers`, not `mcpServers`, in `.vscode/mcp.json`.',
				code: COPILOT_CONFIG
			}
		],
		followUp: 'MCP tools only work in Copilot Agent mode.'
	},
	{
		id: 'cursor',
		label: 'Cursor',
		description:
			'Copy the DryUI skill into the repo and add the MCP server for in-editor discovery and validation.',
		sections: [
			{
				title: 'Install the skill',
				note: 'Copy to `.cursor/skills/` or `.agents/skills/`.',
				code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui`
			},
			{
				title: 'Add the MCP server',
				note: 'Put this in `.cursor/mcp.json`.',
				code: MCP_SERVERS_CONFIG
			}
		],
		followUp: 'Cursor loads the skill automatically when DryUI is relevant to the task.'
	},
	{
		id: 'windsurf',
		label: 'Windsurf',
		description:
			'Copy the DryUI skill into the repo and add the MCP server for in-editor discovery and validation.',
		sections: [
			{
				title: 'Install the skill',
				note: 'Copy to `.agents/skills/`.',
				code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui`
			},
			{
				title: 'Add the MCP server',
				note: 'Put this in `~/.codeium/windsurf/mcp_config.json`.',
				code: MCP_SERVERS_CONFIG
			}
		],
		followUp: 'Windsurf has a 100-tool limit across all MCP servers. DryUI uses 2.'
	},
	{
		id: 'zed',
		label: 'Zed',
		description:
			'Zed reads AGENTS.md automatically, so add the MCP server for the live tools layer.',
		sections: [
			{
				title: 'Add the MCP server',
				note: 'Put this in `~/.config/zed/settings.json`.',
				code: ZED_CONFIG
			}
		],
		followUp: 'Verify the DryUI MCP is active in the Agent Panel (Cmd+Shift+A).'
	}
] as const;

export function getSetupGuide(id: SetupGuideId): SetupGuide {
	const guide = setupGuides.find((entry) => entry.id === id);
	if (!guide) {
		throw new Error(`Unknown setup guide: ${id}`);
	}
	return guide;
}
