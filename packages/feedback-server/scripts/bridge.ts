#!/usr/bin/env bun
import { spawn } from 'node:child_process';

const SERVER_URL = process.env.DRYUI_FEEDBACK_URL ?? 'http://localhost:4748';
const REPO_PATH = process.cwd();
const SSE_URL = `${SERVER_URL}/events?agent=true`;

type Agent = 'codex' | 'claude' | 'gemini';
type AgentChoice = Agent | 'off';
const ALL_AGENTS: readonly Agent[] = ['codex', 'claude', 'gemini'];

const DEFAULT_AGENT: Agent = (() => {
	const flag = process.argv.find((a) => a.startsWith('--agent='))?.slice('--agent='.length);
	const raw = flag ?? process.env.DRYUI_BRIDGE_AGENT ?? 'codex';
	if (!ALL_AGENTS.includes(raw as Agent)) {
		console.error(`[bridge] unknown agent "${raw}", expected ${ALL_AGENTS.join('|')}`);
		process.exit(1);
	}
	return raw as Agent;
})();

function resolveAgent(submission: Submission): AgentChoice {
	const choice = submission.agent;
	if (choice === 'off' || (choice && ALL_AGENTS.includes(choice as Agent))) return choice;
	return DEFAULT_AGENT;
}

interface SSEEvent<T = unknown> {
	type: string;
	timestamp: string;
	sessionId: string;
	payload: T;
}

interface Submission {
	id: string;
	url: string;
	agent?: AgentChoice;
}

function buildPrompt(s: Submission): string {
	return `New feedback submission ${s.id} on ${s.url}. Call feedback_get_submissions via the dryui-feedback MCP to fetch the screenshot and drawings, act on the change, then resolve with feedback_resolve_submission.`;
}

function shellQuote(s: string): string {
	return `'${s.replace(/'/g, "'\\''")}'`;
}

function osaQuote(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function dispatch(submission: Submission): void {
	const target = resolveAgent(submission);
	if (target === 'off') {
		console.log(`[bridge] skip (off) ${submission.id}`);
		return;
	}
	const prompt = buildPrompt(submission);
	console.log(`[bridge] dispatch → ${target} (${submission.id})`);
	if (target === 'codex') {
		const url = `codex://new?prompt=${encodeURIComponent(prompt)}&path=${encodeURIComponent(REPO_PATH)}`;
		spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
		return;
	}
	const cliName = target === 'claude' ? 'claude' : 'gemini';
	const command = `cd ${shellQuote(REPO_PATH)} && ${cliName} ${shellQuote(prompt)}`;
	const script = `tell application "Terminal" to do script "${osaQuote(command)}"`;
	spawn('osascript', ['-e', script], { stdio: 'ignore', detached: true }).unref();
}

console.log(`[bridge] default    ${DEFAULT_AGENT} (submissions can override)`);
console.log(`[bridge] connecting ${SSE_URL}`);
console.log(`[bridge] workspace ${REPO_PATH}`);

const RECONNECT_DELAY_MS = 2000;

async function streamOnce(): Promise<'reconnect' | 'exit'> {
	const response = await fetch(SSE_URL, { headers: { Accept: 'text/event-stream' } });
	if (!response.ok || !response.body) {
		console.error(`[bridge] SSE failed: ${response.status} ${response.statusText}`);
		return 'reconnect';
	}

	console.log('[bridge] connected, waiting for submissions…');

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { value, done } = await reader.read();
		if (done) return 'reconnect';
		buffer += decoder.decode(value, { stream: true });

		let sep: number;
		while ((sep = buffer.indexOf('\n\n')) !== -1) {
			const raw = buffer.slice(0, sep);
			buffer = buffer.slice(sep + 2);
			const dataLine = raw.split('\n').find((l) => l.startsWith('data: '));
			if (!dataLine) continue;
			try {
				const event = JSON.parse(dataLine.slice(6)) as SSEEvent;
				if (event.type === 'submission.created') {
					dispatch(event.payload as Submission);
				} else {
					console.log(`[bridge] event ${event.type}`);
				}
			} catch {
				continue;
			}
		}
	}
}

while (true) {
	try {
		const next = await streamOnce();
		if (next === 'exit') break;
	} catch (err) {
		console.error(`[bridge] stream error:`, err instanceof Error ? err.message : err);
	}
	console.log(`[bridge] reconnecting in ${RECONNECT_DELAY_MS}ms…`);
	await new Promise((r) => setTimeout(r, RECONNECT_DELAY_MS));
}
