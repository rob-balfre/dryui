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
args = ["-y", "@dryui/mcp"]`;

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
		description: 'Install the DryUI plugin for Claude, or wire the skill and MCP server manually.',
		sections: [
			{
				title: 'Install the plugin',
				note: 'The plugin bundles the DryUI skill and MCP server for Claude.',
				code: `claude plugin marketplace add rob-balfre/dryui
claude plugin install dryui@dryui`
			},
			{
				title: 'Manual alternative',
				note: 'If you do not want the plugin, add the MCP server and copy the skill yourself.',
				code: `claude mcp add dryui -- npx -y @dryui/mcp

git clone --depth 1 --filter=blob:none --sparse https://github.com/rob-balfre/dryui.git /tmp/dryui
cd /tmp/dryui && git sparse-checkout set packages/ui/skills/dryui
mkdir -p .claude/skills && cp -r /tmp/dryui/packages/ui/skills/dryui .claude/skills/`
			},
			{
				title: 'Optional SessionStart hook',
				note: 'Inject `dryui ambient` into Claude Code sessions.',
				code: `dryui install-hook`
			}
		],
		followUp: 'Start a new Claude Code session after wiring the plugin, skill, or hook.'
	},
	{
		id: 'codex',
		label: 'Codex',
		description: 'Install the DryUI skill in Codex, then add the MCP server.',
		sections: [
			{
				title: 'Install the skill',
				note: 'This downloads the DryUI skill and its MCP dependency declaration.',
				code: `$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui`
			},
			{
				title: 'Add the MCP server',
				note: 'Use the command directly, or place the snippet in `.codex/config.toml`.',
				code: `codex mcp add dryui -- npx -y @dryui/mcp

# .codex/config.toml
${CODEX_CONFIG}`
			}
		],
		followUp: 'Restart Codex after wiring the skill and MCP server so ask/check are available.'
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
