export type CliId = 'claude-code' | 'codex' | 'gemini-cli' | 'copilot-cli' | 'opencode' | 'cursor';

export interface CliDefinition {
	readonly id: CliId;
	readonly name: string;
	readonly vendor: string;
	readonly color: string;
	readonly installUrl: string;
	readonly authCommand: string;
}

export const CLI_DEFINITIONS: readonly CliDefinition[] = [
	{
		id: 'claude-code',
		name: 'Claude Code',
		vendor: 'Anthropic',
		color: 'orange',
		installUrl: 'https://docs.anthropic.com/en/docs/claude-code/overview',
		authCommand: 'claude'
	},
	{
		id: 'codex',
		name: 'Codex',
		vendor: 'OpenAI',
		color: 'green',
		installUrl: 'https://github.com/openai/codex',
		authCommand: 'codex login'
	},
	{
		id: 'gemini-cli',
		name: 'Gemini',
		vendor: 'Google',
		color: 'blue',
		installUrl: 'https://github.com/google-gemini/gemini-cli',
		authCommand: 'gemini'
	},
	{
		id: 'copilot-cli',
		name: 'Copilot',
		vendor: 'GitHub',
		color: 'yellow',
		installUrl: 'https://github.com/github/copilot-cli',
		authCommand: 'copilot login'
	},
	{
		id: 'opencode',
		name: 'OpenCode',
		vendor: 'OpenCode',
		color: 'purple',
		installUrl: 'https://github.com/opencode-ai/opencode',
		authCommand: 'opencode providers'
	},
	{
		id: 'cursor',
		name: 'Cursor',
		vendor: 'Cursor',
		color: 'blue',
		installUrl: 'https://cursor.com/cli',
		authCommand: 'agent login'
	}
];
