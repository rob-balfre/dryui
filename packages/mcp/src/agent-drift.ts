import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type DryuiClaudeAgentName = 'dryui-layout' | 'feedback';

export interface StaleDryuiClaudeAgent {
	readonly agent: DryuiClaudeAgentName;
	readonly file: string;
	readonly reason: string;
}

interface StaleAgentRule {
	readonly pattern: RegExp;
	readonly reason: string;
}

const STALE_AGENT_RULES: Readonly<Record<DryuiClaudeAgentName, readonly StaleAgentRule[]>> = {
	'dryui-layout': [
		{
			pattern: /\bAreaGrid\b/,
			reason: 'references the removed AreaGrid layout API'
		},
		{
			pattern: /packages\/ui\/skills\/dryui-layout\/SKILL\.md/,
			reason: 'points at the old canonical dryui-layout skill path'
		},
		{
			pattern: /src\/layout\.css`?\s+is\s+whitespace-only/i,
			reason: 'uses the old whitespace-only src/layout.css contract'
		}
	],
	feedback: [
		{
			pattern: /\bAreaGrid\b/,
			reason: 'references the removed AreaGrid layout API'
		},
		{
			pattern: /packages\/feedback-server\/skills\/dryui-feedback\/SKILL\.md/,
			reason: 'points at the old canonical dryui-feedback skill path'
		},
		{
			pattern: /layoutBoxes\[\]/,
			reason: 'uses the old feedback layoutBoxes intent shape'
		},
		{
			pattern: /five intent kinds/i,
			reason: 'uses the old five-intent feedback workflow'
		}
	]
};

function agentNameFromFileName(fileName: string): DryuiClaudeAgentName | null {
	const base = fileName.endsWith('.md') ? fileName.slice(0, -3) : fileName;
	return base === 'dryui-layout' || base === 'feedback' ? base : null;
}

export function staleDryuiClaudeAgentReason(
	agent: DryuiClaudeAgentName,
	content: string
): string | null {
	for (const rule of STALE_AGENT_RULES[agent]) {
		if (rule.pattern.test(content)) return rule.reason;
	}
	return null;
}

export function isStaleDryuiClaudeAgentFile(fileName: string, content: string): boolean {
	const agent = agentNameFromFileName(fileName);
	return agent ? staleDryuiClaudeAgentReason(agent, content) !== null : false;
}

export function detectStaleDryuiClaudeAgents(root: string | null): StaleDryuiClaudeAgent[] {
	if (!root) return [];

	const findings: StaleDryuiClaudeAgent[] = [];
	for (const agent of Object.keys(STALE_AGENT_RULES) as DryuiClaudeAgentName[]) {
		const file = resolve(root, '.claude', 'agents', `${agent}.md`);
		if (!existsSync(file)) continue;

		let content: string;
		try {
			content = readFileSync(file, 'utf8');
		} catch {
			continue;
		}

		const reason = staleDryuiClaudeAgentReason(agent, content);
		if (reason) findings.push({ agent, file, reason });
	}
	return findings;
}
