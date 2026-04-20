import type { SubmissionAgent } from '../../src/types.js';

export type DispatchAgent = Exclude<SubmissionAgent, 'off'>;

interface AgentInfo {
	id: DispatchAgent;
	label: string;
	shortLabel: string;
}

export const AGENT_INFO: Record<DispatchAgent, AgentInfo> = {
	claude: { id: 'claude', label: 'Claude Code', shortLabel: 'Claude' },
	codex: { id: 'codex', label: 'Codex', shortLabel: 'Codex' },
	gemini: { id: 'gemini', label: 'Gemini CLI', shortLabel: 'Gemini' },
	opencode: { id: 'opencode', label: 'OpenCode', shortLabel: 'OpenCode' },
	copilot: { id: 'copilot', label: 'Copilot CLI', shortLabel: 'Copilot CLI' },
	'copilot-vscode': {
		id: 'copilot-vscode',
		label: 'Copilot VS Code',
		shortLabel: 'Copilot VS'
	},
	cursor: { id: 'cursor', label: 'Cursor', shortLabel: 'Cursor' },
	windsurf: { id: 'windsurf', label: 'Windsurf', shortLabel: 'Windsurf' },
	zed: { id: 'zed', label: 'Zed', shortLabel: 'Zed' }
};
