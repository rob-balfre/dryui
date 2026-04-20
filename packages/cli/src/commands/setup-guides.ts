export type SetupGuideId =
	| 'claude-code'
	| 'codex'
	| 'gemini'
	| 'opencode'
	| 'copilot'
	| 'cursor'
	| 'windsurf'
	| 'zed';

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

const GEMINI_CONFIG = `{
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

const OPENCODE_CONFIG = `{
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

const SVELTE_MCP_NOTE =
	'Adds list-sections, get-documentation, svelte-autofixer, and playground-link. `dryui setup --install` registers it automatically (pass `--no-svelte-mcp` to skip).';

const SVELTE_SECTION_CLAUDE: SetupGuideSection = {
	title: 'Svelte companion (recommended)',
	note: `${SVELTE_MCP_NOTE} Prefer the official Claude plugin. If you cannot use plugins, the MCP-only fallback below still works.`,
	code: `claude plugin marketplace add sveltejs/ai-tools
claude plugin install svelte@svelte

# MCP-only fallback
claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`
};

const SVELTE_SECTION_CODEX: SetupGuideSection = {
	title: 'Svelte MCP (recommended companion)',
	note: `${SVELTE_MCP_NOTE} Append this block to \`~/.codex/config.toml\`.`,
	code: `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]`
};

const SVELTE_SECTION_GEMINI: SetupGuideSection = {
	title: 'Svelte MCP (recommended companion)',
	note: `${SVELTE_MCP_NOTE} Gemini CLI does not bundle this; run it once to register the server for this user.`,
	code: 'gemini mcp add -t stdio -s user svelte npx -y @sveltejs/mcp'
};

const SVELTE_SECTION_OPENCODE: SetupGuideSection = {
	title: 'Svelte MCP (recommended companion)',
	note: `${SVELTE_MCP_NOTE} Adds a third entry under the \`mcp\` object in \`opencode.json\`.`,
	code: `"svelte": {
  "type": "local",
  "command": ["npx", "-y", "@sveltejs/mcp"]
}`
};

const SVELTE_SECTION_COPILOT: SetupGuideSection = {
	title: 'Svelte MCP (recommended companion)',
	note: `${SVELTE_MCP_NOTE} Adds a sibling entry under \`servers\` in \`.vscode/mcp.json\`.`,
	code: `"svelte": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@sveltejs/mcp"]
}`
};

const SVELTE_SECTION_MCP_SERVERS: SetupGuideSection = {
	title: 'Svelte MCP (recommended companion)',
	note: `${SVELTE_MCP_NOTE} Adds a sibling entry under \`mcpServers\`.`,
	code: `"svelte": {
  "command": "npx",
  "args": ["-y", "@sveltejs/mcp"]
}`
};

const SVELTE_SECTION_ZED: SetupGuideSection = {
	title: 'Svelte MCP (recommended companion)',
	note: `${SVELTE_MCP_NOTE} Adds a sibling entry under \`context_servers\`.`,
	code: `"svelte": {
  "command": {
    "path": "npx",
    "args": ["-y", "@sveltejs/mcp"]
  }
}`
};

export const setupGuideIds: readonly SetupGuideId[] = [
	'claude-code',
	'codex',
	'gemini',
	'opencode',
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
			},
			SVELTE_SECTION_CLAUDE
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
			},
			SVELTE_SECTION_CODEX
		],
		followUp:
			'After installing the plugin, start a new Codex session so `ask` / `check` are available.'
	},
	{
		id: 'gemini',
		label: 'Gemini CLI',
		description:
			'Install the DryUI extension for Gemini. The extension is the canonical Gemini skill path.',
		sections: [
			{
				title: 'Install the extension',
				note: 'Gemini CLI installs extensions from a local path. Clone DryUI, then point Gemini at `packages/plugin/`. The extension bundles GEMINI.md plus the dryui and dryui-feedback MCP servers.',
				code: `git clone https://github.com/rob-balfre/dryui ~/dryui
gemini extensions install ~/dryui/packages/plugin`
			},
			{
				title: 'Optional MCP-only fallback',
				note: 'Only use this if you cannot install the extension. It does not install GEMINI.md with the bundled DryUI skill.',
				code: GEMINI_CONFIG
			},
			SVELTE_SECTION_GEMINI
		],
		followUp: 'After installing the extension, restart Gemini so `ask` / `check` are available.'
	},
	{
		id: 'opencode',
		label: 'OpenCode',
		description:
			"Use OpenCode's native skill path plus local MCP config so DryUI conventions and tools are available in-editor.",
		sections: [
			{
				title: 'Install the skill',
				note: 'Copy to `.opencode/skills/` for the native OpenCode path. `.agents/skills/` also works if you want a shared cross-tool folder.',
				code: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .opencode/skills/dryui`
			},
			{
				title: 'Add the MCP servers',
				note: 'Put this in `opencode.json` at the project root. OpenCode expects local MCP servers under `mcp` with `type: "local"`.',
				code: OPENCODE_CONFIG
			},
			SVELTE_SECTION_OPENCODE
		],
		followUp:
			'OpenCode also reads `AGENTS.md` and `.agents/skills/` compatibility paths. Restart OpenCode after wiring `opencode.json`.'
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
			},
			SVELTE_SECTION_COPILOT
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
			},
			SVELTE_SECTION_MCP_SERVERS
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
			},
			SVELTE_SECTION_MCP_SERVERS
		],
		followUp:
			'Windsurf has a 100-tool limit across all MCP servers. DryUI uses 2 and @sveltejs/mcp adds 4.'
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
			},
			SVELTE_SECTION_ZED
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
