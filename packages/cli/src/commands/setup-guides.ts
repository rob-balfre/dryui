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
  "mcpServers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@dryui/mcp"]
    },
    "dryui-feedback": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]
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
	'Adds list-sections, get-documentation, svelte-autofixer, and playground-link. Use this companion whenever an agent writes Svelte or SvelteKit code.';

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
	note: `${SVELTE_MCP_NOTE} Adds a sibling entry under \`mcpServers\` in \`.mcp.json\`.`,
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
			'Install the DryUI skills via npx skills, then add the dryui and dryui-feedback MCP servers for Claude.',
		sections: [
			{
				title: 'Install the DryUI skills',
				note: 'Uses the upstream npx skills CLI (skills.sh standard).',
				code: `npx skills add rob-balfre/dryui`
			},
			{
				title: 'Add the MCP servers',
				note: 'Adds DryUI skills context plus visual feedback tools to Claude Code.',
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
		followUp: 'Start a new Claude Code session after installing the skills and MCP servers.'
	},
	{
		id: 'codex',
		label: 'Codex',
		description:
			'Install the DryUI skills via npx skills, then add the dryui and dryui-feedback MCP servers for Codex.',
		sections: [
			{
				title: 'Install the DryUI skills',
				note: 'Uses the upstream npx skills CLI (skills.sh standard).',
				code: `npx skills add rob-balfre/dryui`
			},
			{
				title: 'Add the MCP servers',
				note: 'Adds DryUI skills context plus visual feedback tools to Codex.',
				code: `codex mcp add dryui -- npx -y @dryui/mcp
codex mcp add dryui-feedback -- npx -y -p @dryui/feedback-server dryui-feedback-mcp

# .codex/config.toml
${CODEX_CONFIG}`
			},
			SVELTE_SECTION_CODEX
		],
		followUp:
			'After installing the skills and MCP servers, start a new Codex session so DryUI guidance and feedback tools are available.'
	},
	{
		id: 'gemini',
		label: 'Gemini CLI',
		description:
			'Install the DryUI skill via npx skills (skills.sh standard), then merge the dryui and dryui-feedback MCP servers into Gemini settings.',
		sections: [
			{
				title: 'Install the skill',
				note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .gemini/skills/dryui`.',
				code: `npx skills add rob-balfre/dryui --agent gemini-cli`
			},
			{
				title: 'Add the MCP servers',
				note: '`dryui setup --editor gemini` prints the exact server block for `~/.gemini/settings.json`.',
				code: GEMINI_CONFIG
			},
			SVELTE_SECTION_GEMINI
		],
		followUp: 'Restart Gemini after installing so DryUI guidance and feedback tools are available.'
	},
	{
		id: 'opencode',
		label: 'OpenCode',
		description:
			"Use OpenCode's native skill path plus local MCP config so DryUI conventions and tools are available in-editor.",
		sections: [
			{
				title: 'Install the skill',
				note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .opencode/skills/dryui`.',
				code: `npx skills add rob-balfre/dryui --agent opencode`
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
		label: 'GitHub Copilot',
		description:
			'Copy the DryUI skill into the repo and add the MCP servers for Copilot CLI and VS Code Agent mode.',
		sections: [
			{
				title: 'Install the skill',
				note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .github/skills/dryui`.',
				code: `npx skills add rob-balfre/dryui --agent github-copilot`
			},
			{
				title: 'Add the MCP servers',
				note: 'Copilot CLI reads `.mcp.json` at the project root (workspace) and `~/.copilot/mcp-config.json` (user). The schema uses `mcpServers`, same as Claude Code. The VS Code Copilot extension still reads `.vscode/mcp.json` with a `servers` key — if you rely on it there, duplicate the entries into `.vscode/mcp.json` under `servers`.',
				code: COPILOT_CONFIG
			},
			SVELTE_SECTION_COPILOT
		],
		followUp:
			'MCP tools are available in Copilot CLI and VS Code Copilot Agent mode. Start a fresh session after wiring.'
	},
	{
		id: 'cursor',
		label: 'Cursor',
		description:
			'Copy the DryUI skill into the repo and add the MCP server for in-editor discovery and validation.',
		sections: [
			{
				title: 'Install the skill',
				note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .agents/skills/dryui`.',
				code: `npx skills add rob-balfre/dryui --agent cursor`
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
				note: 'Routed through the upstream npx skills CLI (skills.sh standard). For a pinned manual install: `npx degit rob-balfre/dryui/skills/dryui .agents/skills/dryui`.',
				code: `npx skills add rob-balfre/dryui --agent windsurf`
			},
			{
				title: 'Add the MCP server',
				note: 'Put this in `~/.codeium/windsurf/mcp_config.json`.',
				code: MCP_SERVERS_CONFIG
			},
			SVELTE_SECTION_MCP_SERVERS
		],
		followUp:
			'Windsurf has a 100-tool limit across all MCP servers. DryUI uses 3 and @sveltejs/mcp adds 4.'
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
