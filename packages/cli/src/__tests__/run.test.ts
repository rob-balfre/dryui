import { afterEach, describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import {
	printCommandHelp,
	renderCommandResultByMode,
	runFileCommand,
	runStandardCommand
} from '../run.js';
import { captureCommandIO, cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('renderCommandResultByMode', () => {
	test('renders toon, json, and text output', () => {
		const value = { name: 'Card' };

		expect(
			renderCommandResultByMode('toon', value, {
				toon: (item) => `toon:${item.name}`,
				json: (item) => `json:${item.name}`,
				text: (item) => `text:${item.name}`
			})
		).toMatchObject({ output: 'toon:Card', error: null, exitCode: 0 });

		expect(
			renderCommandResultByMode('json', value, {
				toon: (item) => `toon:${item.name}`,
				json: (item) => `json:${item.name}`,
				text: (item) => `text:${item.name}`
			})
		).toMatchObject({ output: 'json:Card', error: null, exitCode: 0 });

		expect(
			renderCommandResultByMode('text', value, {
				toon: (item) => `toon:${item.name}`,
				json: (item) => `json:${item.name}`,
				text: (item) => `text:${item.name}`
			})
		).toMatchObject({ output: 'text:Card', error: null, exitCode: 0 });
	});
});

describe('runFileCommand', () => {
	test('returns a missing-file result when the file does not exist', () => {
		const result = runFileCommand('/tmp/dryui-does-not-exist', 'text', () => {
			throw new Error('should not run');
		});

		expect(result.exitCode).toBe(1);
		expect(result.error).toContain('File not found: /tmp/dryui-does-not-exist');
	});

	test('passes file contents to the callback when the file exists', () => {
		const root = createTempTree({
			'content.txt': 'hello world'
		});

		const result = runFileCommand(resolve(root, 'content.txt'), 'text', (contents) => ({
			output: contents.toUpperCase(),
			error: null,
			exitCode: 0
		}));

		expect(result).toEqual({
			output: 'HELLO WORLD',
			error: null,
			exitCode: 0
		});
	});
});

describe('printCommandHelp', () => {
	test('prints a structured help block and exits', () => {
		const result = captureCommandIO(() =>
			printCommandHelp(
				{
					usage: 'dryui demo [--text]',
					description: ['Demo command.'],
					options: ['  --text    Plain text'],
					examples: ['  dryui demo']
				},
				0
			)
		);

		expect(result.logs).toEqual([
			'Usage: dryui demo [--text]',
			'',
			'Demo command.',
			'',
			'Options:',
			'  --text    Plain text',
			'',
			'Examples:',
			'  dryui demo'
		]);
		expect(result.exitCode).toBe(0);
	});
});

describe('runStandardCommand', () => {
	test('prints help when a required positional argument is missing', () => {
		const result = captureCommandIO(() =>
			runStandardCommand([], {
				help: {
					usage: 'dryui demo <value>',
					description: ['Demo command.']
				},
				minPositionals: 1,
				execute: () => ({
					output: 'should not run',
					error: null,
					exitCode: 0
				})
			})
		);

		expect(result.logs).toEqual(['Usage: dryui demo <value>', '', 'Demo command.']);
		expect(result.exitCode).toBe(1);
	});

	test('executes the command with resolved mode and positionals', () => {
		const result = captureCommandIO(() =>
			runStandardCommand(['--text', 'Card'], {
				help: {
					usage: 'dryui demo <value>',
					description: ['Demo command.']
				},
				minPositionals: 1,
				execute: ({ mode, positionals }) => ({
					output: `${mode}:${positionals.join(',')}`,
					error: null,
					exitCode: 0
				})
			})
		);

		expect(result.logs).toEqual(['text:Card']);
		expect(result.exitCode).toBe(0);
	});
});
