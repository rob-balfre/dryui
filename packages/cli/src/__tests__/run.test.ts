import { afterEach, describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import {
	commandError,
	emitCommandResult,
	emitOrRun,
	fileNotFound,
	getFlag,
	hasFlag,
	homeRelative,
	isInteractiveTTY,
	printCommandHelp,
	renderCommandResultByMode,
	resolveOutputMode,
	runCommand,
	runFileCommand,
	runStandardCommand
} from '../run.js';
import { captureCommandIO, cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('flag helpers', () => {
	test('detects boolean flags and flag values', () => {
		const args = ['--text', '--cwd', '/tmp/demo'];

		expect(hasFlag(args, '--text')).toBe(true);
		expect(hasFlag(args, '--json')).toBe(false);
		expect(getFlag(args, '--cwd')).toBe('/tmp/demo');
		expect(getFlag(args, '--missing')).toBeUndefined();
	});
});

describe('homeRelative', () => {
	test('rewrites paths under HOME to a tilde form', () => {
		const originalHome = process.env.HOME;
		process.env.HOME = '/Users/dryui';

		try {
			expect(homeRelative('/Users/dryui/projects/demo')).toBe('~/projects/demo');
			expect(homeRelative('/tmp/demo')).toBe('/tmp/demo');
		} finally {
			if (originalHome === undefined) {
				delete process.env.HOME;
			} else {
				process.env.HOME = originalHome;
			}
		}
	});
});

describe('resolveOutputMode', () => {
	test('defaults to toon, supports text, and ignores json when disallowed', () => {
		expect(resolveOutputMode([])).toEqual({
			mode: 'toon',
			toon: true,
			json: false,
			text: false
		});
		expect(resolveOutputMode(['--text'])).toEqual({
			mode: 'text',
			toon: false,
			json: false,
			text: true
		});
		expect(resolveOutputMode(['--json'], false)).toEqual({
			mode: 'toon',
			toon: true,
			json: false,
			text: false
		});
	});
});

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

describe('command error helpers', () => {
	test('formats structured errors for toon mode', () => {
		const result = commandError('toon', 'invalid-settings', 'Broken JSON', ['Fix the file']);

		expect(result.output).toBe('');
		expect(result.error).toContain('error[1]{code,message}: invalid-settings,Broken JSON');
		expect(result.error).toContain('Fix the file');
		expect(result.exitCode).toBe(1);
	});

	test('formats plain text errors and missing-file checks for text mode', () => {
		expect(commandError('text', 'invalid-settings', 'Broken JSON')).toEqual({
			output: '',
			error: 'Broken JSON',
			exitCode: 1
		});
		expect(fileNotFound('/tmp/dryui-does-not-exist', 'text')).toMatchObject({
			exitCode: 1,
			error: 'File not found: /tmp/dryui-does-not-exist'
		});
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

describe('command emission', () => {
	test('emitCommandResult sends text errors to stderr and structured errors to stdout', () => {
		const textError = captureCommandIO(() =>
			emitCommandResult({ output: '', error: 'plain failure', exitCode: 1 }, 'text')
		);
		expect(textError.logs).toEqual([]);
		expect(textError.errors).toEqual(['plain failure']);

		const toonError = captureCommandIO(() =>
			emitCommandResult({ output: '', error: 'status: error', exitCode: 1 }, 'toon')
		);
		expect(toonError.logs).toEqual(['status: error']);
		expect(toonError.errors).toEqual([]);
	});

	test('runCommand and emitOrRun honour exit behaviour', () => {
		const command = { output: 'ok', error: null, exitCode: 0 };

		const runResult = captureCommandIO(() => runCommand(command, 'text'));
		expect(runResult.logs).toEqual(['ok']);
		expect(runResult.exitCode).toBe(0);

		const emitted = captureCommandIO(() => emitOrRun(command, 'text', false));
		expect(emitted.logs).toEqual(['ok']);
		expect(emitted.exitCode).toBeNull();

		const exited = captureCommandIO(() => emitOrRun(command, 'text', true));
		expect(exited.logs).toEqual(['ok']);
		expect(exited.exitCode).toBe(0);
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

describe('tty detection', () => {
	test('isInteractiveTTY reflects the current stdio flags', () => {
		expect(typeof isInteractiveTTY()).toBe('boolean');
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

	test('prints help for --help and ignores json for commands that disable it', () => {
		const helpResult = captureCommandIO(() =>
			runStandardCommand(['--help'], {
				help: {
					usage: 'dryui demo <value>',
					description: ['Demo command.']
				},
				execute: () => ({
					output: 'should not run',
					error: null,
					exitCode: 0
				})
			})
		);

		expect(helpResult.logs).toEqual(['Usage: dryui demo <value>', '', 'Demo command.']);
		expect(helpResult.exitCode).toBe(0);

		const jsonDisabled = captureCommandIO(() =>
			runStandardCommand(['--json', 'Card'], {
				help: {
					usage: 'dryui demo <value>',
					description: ['Demo command.']
				},
				allowJson: false,
				minPositionals: 1,
				execute: ({ mode }) => ({
					output: mode,
					error: null,
					exitCode: 0
				})
			})
		);

		expect(jsonDisabled.logs).toEqual(['toon']);
		expect(jsonDisabled.exitCode).toBe(0);
	});
});
