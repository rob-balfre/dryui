import { describe, expect, test } from 'bun:test';
import agentContractData from '@dryui/mcp/agent-contract.v1.json';
import type { AgentContractV1 } from '@dryui/mcp/agent-contract';
import { getPromptForComponent, runPrompt } from '../commands/prompt.js';
import { captureCommandIO } from './helpers.js';

const agentContract = agentContractData as AgentContractV1;

describe('getPromptForComponent', () => {
	test('returns deterministic component prompt context', () => {
		const { output, error, exitCode } = getPromptForComponent('Button', agentContract, 'text');
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI component prompt: Button');
		expect(output).toContain("import { Button } from '@dryui/ui'");
		expect(output).toContain('<Button');
		expect(output).toContain('Rules:');
		expect(output).toContain('Anti-patterns:');
		expect(output).toContain('Validation steps:');
		expect(output).toContain('dryui check <file.svelte>');
	});

	test('returns a not-found error for unknown components', () => {
		const { output, error, exitCode } = getPromptForComponent('Nope', agentContract, 'text');
		expect(exitCode).toBe(1);
		expect(output).toBe('');
		expect(error).toContain('Unknown component: "Nope"');
	});
});

describe('runPrompt', () => {
	test('prints component prompt output', () => {
		const result = captureCommandIO(() => runPrompt(['--component', 'Button'], agentContract));
		expect(result.exitCode).toBe(0);
		expect(result.errors).toEqual([]);
		expect(result.logs.join('\n')).toContain('DryUI component prompt: Button');
	});

	test('requires --component', () => {
		const result = captureCommandIO(() => runPrompt([], agentContract));
		expect(result.exitCode).toBe(1);
		expect(result.logs.join('\n')).toContain('prompt requires --component <name>');
	});
});
