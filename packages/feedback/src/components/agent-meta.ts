import type { SubmissionAgent } from '../types.js';

export interface AgentMeta {
	id: SubmissionAgent;
	label: string;
	shortLabel: string;
	description: string;
	mode: 'prompt' | 'clipboard' | 'off';
}

export const AGENT_META: Record<SubmissionAgent, AgentMeta> = {
	claude: {
		id: 'claude',
		label: 'Claude Code',
		shortLabel: 'Claude',
		description: 'Launch Claude Code with the feedback prompt.',
		mode: 'prompt'
	},
	codex: {
		id: 'codex',
		label: 'Codex',
		shortLabel: 'Codex',
		description: 'Open Codex with the DryUI plugin chip prefilled.',
		mode: 'prompt'
	},
	gemini: {
		id: 'gemini',
		label: 'Gemini CLI',
		shortLabel: 'Gemini',
		description: 'Start Gemini CLI and pass the feedback prompt.',
		mode: 'prompt'
	},
	opencode: {
		id: 'opencode',
		label: 'OpenCode',
		shortLabel: 'OpenCode',
		description: 'Start OpenCode in this workspace with the prompt ready.',
		mode: 'prompt'
	},
	copilot: {
		id: 'copilot',
		label: 'Copilot CLI',
		shortLabel: 'Copilot CLI',
		description: 'Launch Copilot CLI with the feedback prompt.',
		mode: 'prompt'
	},
	'copilot-vscode': {
		id: 'copilot-vscode',
		label: 'Copilot VS Code',
		shortLabel: 'Copilot VS',
		description: 'Open VS Code Copilot Agent mode and copy the feedback prompt.',
		mode: 'clipboard'
	},
	cursor: {
		id: 'cursor',
		label: 'Cursor',
		shortLabel: 'Cursor',
		description: 'Open Cursor and copy the feedback prompt to the clipboard.',
		mode: 'clipboard'
	},
	windsurf: {
		id: 'windsurf',
		label: 'Windsurf',
		shortLabel: 'Windsurf',
		description: 'Open Windsurf and copy the feedback prompt to the clipboard.',
		mode: 'clipboard'
	},
	zed: {
		id: 'zed',
		label: 'Zed',
		shortLabel: 'Zed',
		description: 'Open Zed and copy the feedback prompt to the clipboard.',
		mode: 'clipboard'
	},
	off: {
		id: 'off',
		label: 'Off',
		shortLabel: 'Off',
		description: 'Keep feedback in the queue without auto-launching an editor.',
		mode: 'off'
	}
};
