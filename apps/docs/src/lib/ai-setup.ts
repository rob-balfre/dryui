import { aiSurface } from '../../../../packages/mcp/src/ai-surface.js';

export type AiAgentId = 'codex' | 'claude-code' | 'cursor';

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

function joinNames(items: readonly { readonly name: string }[]): string {
	return items.map(({ name }) => name).join(', ');
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

const MCP_PROMPT_COLORS: Readonly<Record<string, AiSurfaceCard['color']>> = {
	'dryui-compose': 'orange',
	'dryui-info': 'blue',
	'dryui-list': 'purple',
	'dryui-review': 'blue',
	'dryui-install': 'green',
	'dryui-add': 'orange',
	'dryui-diagnose': 'green',
	'dryui-get': 'gray'
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
	lint: 'dryui lint --json --max-severity warning'
};

export const dryuiMcpTools: readonly AiSurfaceCard[] = aiSurface.tools.map((tool) => ({
	name: tool.name,
	description: tool.description,
	color: MCP_TOOL_COLORS[tool.name] ?? 'gray'
}));

export const dryuiMcpPrompts: readonly AiSurfaceCard[] = aiSurface.prompts.map((prompt) => ({
	name: prompt.name,
	description: prompt.description,
	color: MCP_PROMPT_COLORS[prompt.name] ?? 'gray'
}));

export const dryuiCliCommands: readonly AiSurfaceCard[] = aiSurface.cliCommands.map((command) => ({
	name: command.name,
	description: command.description,
	color: CLI_COMMAND_COLORS[command.name] ?? 'gray',
	...(CLI_COMMAND_EXAMPLES[command.name] ? { example: CLI_COMMAND_EXAMPLES[command.name] } : {})
}));

const projectMcpConfig = `{
  "mcpServers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["@dryui/mcp"]
    }
  }
}`;

const codexMcpConfig = `[mcp_servers.dryui]
command = "npx"
args = ["-y", "@dryui/mcp"]`;

const cursorMcpConfig = `{
  "mcpServers": {
    "dryui": {
      "command": "npx",
      "args": ["@dryui/mcp"]
    }
  }
}`;

export const aiAgentSetups: AiAgentSetup[] = [
	{
		id: 'codex',
		label: 'Codex',
		description:
			'Use the bundled DryUI skill for conventions and add the MCP server when you want the current lookup, retrieval, composition, validation, diagnosis, and project-planning tools in the same session.',
		skill: {
			title: 'DryUI skill',
			note: "From a clone of the dryui repo, link the bundled skill into Codex's skills directory (`$CODEX_HOME/skills`).",
			code: `mkdir -p "$CODEX_HOME/skills"
ln -sfn "$(pwd)/packages/ui/skills/dryui" "$CODEX_HOME/skills/dryui"`
		},
		mcp: {
			path: '.codex/config.toml',
			note: `Append the MCP server block to your Codex config file (project-scoped or global at ~/.codex/config.toml) so Codex can call ${joinNames(dryuiMcpTools)}.`,
			code: codexMcpConfig,
			language: 'toml'
		},
		followUp: 'Restart Codex after linking the skill so it picks up the updated agent setup.'
	},
	{
		id: 'claude-code',
		label: 'Claude Code',
		description:
			'Claude Code can use the DryUI skill for conventions and the MCP server for lookup, source retrieval, composition, validation, diagnosis, and project planning.',
		skill: {
			title: 'DryUI skill',
			note: 'From a clone of the dryui repo, link the bundled skill into your project-local Claude Code skills folder.',
			code: `mkdir -p .claude/skills
ln -sfn "$(pwd)/packages/ui/skills/dryui" .claude/skills/dryui`
		},
		mcp: {
			path: '.mcp.json',
			note: `Add to .mcp.json in your project root so Claude Code can call DryUI ${joinNames(dryuiMcpTools)} tools.`,
			code: projectMcpConfig,
			language: 'json'
		},
		followUp:
			'The skill is optional but recommended when you want Claude Code to follow DryUI conventions before reaching for MCP tools.'
	},
	{
		id: 'cursor',
		label: 'Cursor',
		description: 'Cursor uses MCP configuration only. The bundled DryUI skill does not apply here.',
		mcp: {
			path: '.cursor/mcp.json',
			note: `Add to .cursor/mcp.json in your project root so Cursor can call DryUI ${joinNames(dryuiMcpTools)} tools.`,
			code: cursorMcpConfig,
			language: 'json'
		},
		followUp:
			'Cursor does not use the bundled DryUI skill, so MCP setup is the full integration path.'
	}
];
