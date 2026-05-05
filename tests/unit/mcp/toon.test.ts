import { describe, expect, test } from 'bun:test';
import { aiSurface } from '../../../packages/mcp/src/ai-surface.ts';
import { toonError } from '../../../packages/mcp/src/toon.ts';

describe('MCP current interface', () => {
	test('exposes no runtime MCP tools or prompts and keeps the current CLI command surface', () => {
		expect(aiSurface.tools).toEqual([]);
		expect(aiSurface.prompts).toEqual([]);
		expect(aiSurface.cliCommands).toEqual([
			{ name: 'ambient', description: 'Print compact session context for SessionStart hooks' },
			{
				name: 'install-hook',
				description: 'Wire `dryui ambient` into Claude Code settings.json'
			},
			{
				name: 'feedback',
				description: 'Start feedback tooling, inspect the server, or launch the dashboard'
			}
		]);
	});
});

describe('toonError', () => {
	test('formats escaped legacy TOON error payloads for CLI and tool adapters', () => {
		const output = toonError('bad,code', 'line 1\n"quoted"', ['use skills', 'dryui feedback']);

		expect(output).toBe(
			'error[1]{code,message}: "bad,code","line 1\n""quoted"""\n' +
				'suggestions[2]{value}:\n' +
				'  use skills\n' +
				'  dryui feedback'
		);
	});

	test('omits the suggestions block when no suggestions are provided', () => {
		expect(toonError('internal-error', 'Use installed DryUI skills.')).toBe(
			'error[1]{code,message}: internal-error,Use installed DryUI skills.'
		);
	});
});
