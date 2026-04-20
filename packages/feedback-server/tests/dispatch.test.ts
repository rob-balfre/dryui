import { describe, expect, test } from 'bun:test';
import { buildVsCodeChatArgs, resolveVsCodeCliWith } from '../src/dispatch.ts';

describe('VS Code dispatch resolution', () => {
	test('prefers the macOS VS Code app CLI over a non-VS Code code binary on PATH', () => {
		const supportChecks: string[] = [];

		const resolved = resolveVsCodeCliWith({
			currentPlatform: 'darwin',
			homeDir: '/Users/tester',
			resolveCommand: (command) => (command === 'code' ? '/usr/local/bin/code' : null),
			pathExists: (path) =>
				path === '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' ||
				path === '/usr/local/bin/code',
			supportsChat: (command) => {
				supportChecks.push(command);
				return command === '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
			}
		});

		expect(resolved).toEqual({
			command: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
			urlScheme: 'vscode'
		});
		expect(supportChecks).toEqual([
			'/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
		]);
	});

	test('falls through to code-insiders when stable code does not support chat', () => {
		const resolved = resolveVsCodeCliWith({
			currentPlatform: 'linux',
			homeDir: '/home/tester',
			resolveCommand: (command) => {
				if (command === 'code') return '/usr/bin/code';
				if (command === 'code-insiders') return '/usr/bin/code-insiders';
				return null;
			},
			pathExists: (path) => path === '/usr/bin/code' || path === '/usr/bin/code-insiders',
			supportsChat: (command) => command === '/usr/bin/code-insiders'
		});

		expect(resolved).toEqual({
			command: '/usr/bin/code-insiders',
			urlScheme: 'vscode-insiders'
		});
	});

	test('builds a VS Code chat invocation that keeps the prompt intact', () => {
		expect(buildVsCodeChatArgs('Implement the feedback widget fix')).toEqual([
			'chat',
			'--mode',
			'agent',
			'Implement the feedback widget fix'
		]);
	});
});
