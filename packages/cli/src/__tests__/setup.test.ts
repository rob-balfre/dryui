import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
	formatGuidePreviewLines,
	formatPromptFrameLines,
	formatSelectScreenLines
} from '../commands/setup.js';
import { getSetupGuide } from '../commands/setup-guides.js';

const originalNoColor = process.env.NO_COLOR;

beforeEach(() => {
	process.env.NO_COLOR = '1';
});

afterEach(() => {
	if (originalNoColor === undefined) {
		delete process.env.NO_COLOR;
		return;
	}

	process.env.NO_COLOR = originalNoColor;
});

describe('setup menu formatting', () => {
	test('renders workspace context as a bordered table', () => {
		const lines = formatPromptFrameLines('What would you like to do?', {
			contextLines: ['cwd: ~/druid', 'project: ready · sveltekit · bun', 'root: ~/druid']
		});

		expect(lines).toContain('Current workspace');
		expect(lines).toContain('┌─────────┬─────────────────────────┐');
		expect(lines).toContain('│ cwd     │ ~/druid                 │');
		expect(lines).toContain('│ project │ ready · sveltekit · bun │');
		expect(lines).toContain('│ root    │ ~/druid                 │');
		expect(lines).toContain('└─────────┴─────────────────────────┘');
		expect(lines).toContain('What would you like to do?');
	});

	test('stacks continuation rows with blank label cells', () => {
		const lines = formatPromptFrameLines('What would you like to do?', {
			contextLines: [
				'cwd: ~/druid',
				'agents: claude    plugin + svelte',
				'  codex     plugin + mcp + svelte',
				'  gemini    mcp + svelte'
			]
		});

		expect(lines).toContain('│ cwd    │ ~/druid                         │');
		expect(lines).toContain('│ agents │ claude    plugin + svelte       │');
		expect(lines).toContain('│        │ codex     plugin + mcp + svelte │');
		expect(lines).toContain('│        │ gemini    mcp + svelte          │');
	});

	test('renders row separators between every row automatically', () => {
		const lines = formatPromptFrameLines('What would you like to do?', {
			contextLines: [
				'cwd: ~/druid',
				'project: ready · svelte · bun',
				'deps: ✓ ui   · primitives   ✓ lint'
			]
		});

		const midSeparators = lines.filter(
			(line) => line === '├─────────┼──────────────────────────────┤'
		);
		expect(midSeparators.length).toBe(2);
		expect(lines).toContain('│ project │ ready · svelte · bun         │');
		expect(lines).toContain('│ deps    │ ✓ ui   · primitives   ✓ lint │');
	});

	test('renders menu options with icons and the richer footer', () => {
		const lines = formatSelectScreenLines(
			'What would you like to do?',
			[
				{
					label: 'Set up editor or agent',
					value: 'setup',
					icon: '⌘',
					description: 'Choose Claude, Codex, Gemini, OpenCode, Copilot, Cursor, Windsurf, or Zed.'
				},
				{
					label: 'Exit',
					value: 'exit',
					icon: '⏻'
				}
			],
			0,
			{
				contextLines: ['cwd: ~/druid', 'project: ready']
			}
		);

		expect(lines).toContain('◈ DryUI');
		expect(lines.some((line) => line.includes('⌘ Set up editor or agent'))).toBe(true);
		expect(lines.some((line) => line.includes('↳ Choose Claude, Codex, Gemini'))).toBe(true);
		expect(lines).toContain('↑/↓ move  Enter select  Ctrl+C quit.');
	});

	test('renders a compact guide preview for command-based setup', () => {
		const lines = formatGuidePreviewLines(getSetupGuide('claude-code'));

		expect(lines).toContain('1. Install the plugin');
		expect(lines).toContain('   claude plugin marketplace add rob-balfre/dryui');
		expect(lines).toContain('   claude plugin install dryui@dryui');
		expect(lines).toContain('Optional');
		expect(lines).toContain('   2. Optional MCP-only fallback');
		expect(lines).toContain('   3. Optional SessionStart hook');
		expect(lines).toContain('   4. Svelte companion (recommended)');
		expect(lines.some((line) => line.includes('The plugin bundles the DryUI skill'))).toBe(true);
		expect(lines.some((line) => line.includes('Only use this if you cannot install plugins'))).toBe(
			false
		);
	});

	test('renders a compact guide preview for config-based setup', () => {
		const lines = formatGuidePreviewLines(getSetupGuide('zed'));

		expect(lines).toContain('1. Add the MCP server');
		expect(lines).toContain('   See `dryui setup --editor zed` for the full snippet.');
		expect(lines).toContain('Optional');
		expect(lines).toContain('   2. Svelte MCP (recommended companion)');
	});
});
