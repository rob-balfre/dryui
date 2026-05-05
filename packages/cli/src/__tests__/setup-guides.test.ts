import { describe, expect, test } from 'bun:test';
import { getSetupGuide, setupGuideIds } from '../commands/setup-guides.js';

describe('setup guides', () => {
	test('lists Gemini CLI as a supported setup target', () => {
		expect(setupGuideIds).toContain('gemini');
	});

	test('returns the Claude guide with the preferred Svelte plugin path', () => {
		const guide = getSetupGuide('claude-code');
		const companion = guide.sections.find((section) => section.title.includes('Svelte'));

		expect(companion?.title).toBe('Svelte companion (recommended)');
		expect(companion?.code).toContain('claude plugin marketplace add sveltejs/ai-tools');
		expect(companion?.code).toContain('claude plugin install svelte@svelte');
		expect(companion?.code).toContain('claude mcp add -t stdio -s user svelte');
	});

	test('returns the Gemini CLI guide with the npx skills install path and Svelte companion steps', () => {
		const guide = getSetupGuide('gemini');

		expect(guide.label).toBe('Gemini CLI');
		expect(guide.sections).toHaveLength(3);
		expect(guide.sections[0]?.title).toBe('Install the DryUI skill');
		expect(guide.sections[0]?.code).toContain('npx skills add rob-balfre/dryui');
		expect(guide.sections[1]?.code).toContain('"mcpServers"');
		expect(guide.sections[1]?.code).toContain('dryui-feedback');
		expect(guide.sections[2]?.code).toContain('gemini mcp add -t stdio -s user svelte');
	});
});
