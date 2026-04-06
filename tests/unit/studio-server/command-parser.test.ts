import { describe, expect, it } from 'bun:test';
import {
	parseCommandOutput,
	isDryuiCommand
} from '../../../packages/studio-server/src/command-parser.js';

describe('parseCommandOutput', () => {
	it('parses command arrays from fenced JSON blocks', () => {
		const result = parseCommandOutput(`
      Here is the change:
      \`\`\`json
      [{"type":"select-node","nodeId":"node-1"},{"type":"deselect-all"}]
      \`\`\`
    `);

		expect(result.commands).toHaveLength(2);
		expect(isDryuiCommand(result.commands[0])).toBe(true);
	});

	it('rejects invalid payloads', () => {
		expect(() => parseCommandOutput('No command here.')).toThrow(
			'No DryUI command payload found in output.'
		);
		expect(() => parseCommandOutput('```json\n{"type":"unknown"}\n```')).toThrow(
			'Parsed output contained an invalid DryUI command.'
		);
	});
});
