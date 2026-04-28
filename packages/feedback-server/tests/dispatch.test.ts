import { describe, expect, test } from 'bun:test';
import {
	buildWindsurfChatArgs,
	buildVsCodeChatArgs,
	buildWorkspaceAppLaunch,
	resolveWindsurfCliWith,
	resolveVsCodeCliWith
} from '../src/dispatch.ts';
import { buildFeedbackDispatchPrompt } from '../src/prompts.ts';

describe('feedback prompts', () => {
	test('dispatch prompt walks agents through the full review steps', () => {
		const prompt = buildFeedbackDispatchPrompt({
			id: 'sub-123',
			url: 'https://example.com/page',
			drawings: []
		});

		expect(prompt).toContain(
			'Apply DryUI feedback submission sub-123 (from https://example.com/page)'
		);
		expect(prompt).toContain('node_modules/@dryui/feedback-server/skills/dryui-feedback/SKILL.md');
		expect(prompt).toContain('run `dryui check`');
		expect(prompt).toContain('call `feedback_resolve_submission`');
		expect(prompt).toContain('If PRODUCT.md or DESIGN.md exists at the project root');
		expect(prompt.indexOf('run `dryui check`')).toBeLessThan(
			prompt.indexOf('call `feedback_resolve_submission`')
		);
	});

	test('dispatch prompt appends text notes from the annotation when present', () => {
		const prompt = buildFeedbackDispatchPrompt({
			id: 'sub-456',
			url: 'http://localhost:5173/',
			drawings: [
				{
					id: 'd1',
					kind: 'text',
					color: '#fff',
					position: { x: 10, y: 20 },
					text: 'Add a header bar',
					fontSize: 14
				},
				{
					id: 'd2',
					kind: 'arrow',
					color: '#fff',
					start: { x: 0, y: 0 },
					end: { x: 10, y: 10 },
					width: 2
				}
			]
		});

		expect(prompt).toContain('Text notes from the annotation:');
		expect(prompt).toContain('- Add a header bar');
	});

	test('dispatch prompt omits the notes block when there are no text drawings', () => {
		const prompt = buildFeedbackDispatchPrompt({
			id: 'sub-789',
			url: 'http://localhost:5173/',
			drawings: [
				{
					id: 'd1',
					kind: 'arrow',
					color: '#fff',
					start: { x: 0, y: 0 },
					end: { x: 10, y: 10 },
					width: 2
				}
			]
		});

		expect(prompt).not.toContain('Text notes from the annotation:');
	});
});

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

describe('workspace app dispatch resolution', () => {
	test('prefers the Zed CLI over the macOS app fallback', () => {
		const resolved = buildWorkspaceAppLaunch('zed', '/Users/tester/project', {
			currentPlatform: 'darwin',
			commandExists: (command) => command === 'zed',
			macAppExists: () => true
		});

		expect(resolved).toEqual({
			command: 'zed',
			args: ['/Users/tester/project'],
			strategy: 'cli'
		});
	});

	test('falls back to macOS open when the app exists but the CLI is unavailable', () => {
		const resolved = buildWorkspaceAppLaunch('zed', '/Users/tester/my project', {
			currentPlatform: 'darwin',
			commandExists: () => false,
			macAppExists: (name) => name === 'Zed'
		});

		expect(resolved).toEqual({
			command: 'sh',
			args: ['-c', "open -a 'Zed' '/Users/tester/my project'"],
			strategy: 'mac-open'
		});
	});

	test('reports no launch plan when a macOS workspace app is not installed', () => {
		expect(
			buildWorkspaceAppLaunch('zed', '/Users/tester/project', {
				currentPlatform: 'darwin',
				commandExists: () => false,
				macAppExists: () => false
			})
		).toBeNull();
	});
});

describe('Windsurf dispatch resolution', () => {
	test('prefers the bundled macOS Windsurf CLI when the PATH command is unavailable', () => {
		const supportChecks: string[] = [];

		const resolved = resolveWindsurfCliWith({
			currentPlatform: 'darwin',
			homeDir: '/Users/tester',
			resolveCommand: () => null,
			pathExists: (path) =>
				path === '/Applications/Windsurf.app/Contents/Resources/app/bin/windsurf',
			supportsChat: (command) => {
				supportChecks.push(command);
				return true;
			}
		});

		expect(resolved).toBe('/Applications/Windsurf.app/Contents/Resources/app/bin/windsurf');
		expect(supportChecks).toEqual([
			'/Applications/Windsurf.app/Contents/Resources/app/bin/windsurf'
		]);
	});

	test('falls back to the PATH Windsurf CLI outside macOS app bundles', () => {
		const resolved = resolveWindsurfCliWith({
			currentPlatform: 'linux',
			homeDir: '/home/tester',
			resolveCommand: (command) => (command === 'windsurf' ? '/usr/bin/windsurf' : null),
			pathExists: (path) => path === '/usr/bin/windsurf',
			supportsChat: (command) => command === '/usr/bin/windsurf'
		});

		expect(resolved).toBe('/usr/bin/windsurf');
	});

	test('builds a Windsurf chat invocation that keeps the prompt intact', () => {
		expect(buildWindsurfChatArgs('Fix the feedback screenshot spacing')).toEqual([
			'chat',
			'--mode',
			'agent',
			'--maximize',
			'Fix the feedback screenshot spacing'
		]);
	});
});
