import { describe, expect, it } from 'bun:test';
import { buildSystemPrompt } from '../../../packages/studio-server/src/system-prompt.js';

describe('buildSystemPrompt', () => {
	it('includes document context and command guidance', () => {
		const prompt = buildSystemPrompt({
			workspaceName: 'Studio',
			specSummary: 'Button, Card',
			extraInstructions: ['Prefer reversible changes'],
			document: {
				version: 1,
				id: 'doc-1',
				name: 'Landing',
				createdAt: '2026-03-21T00:00:00.000Z',
				updatedAt: '2026-03-21T00:00:00.000Z',
				canvas: { width: 1200, height: 'auto', background: '#fff' },
				theme: {
					id: 'light',
					label: 'Light',
					mode: 'light',
					vars: {}
				},
				root: {
					id: 'root',
					component: 'Stack',
					part: 'Root',
					props: {},
					cssVarOverrides: {},
					style: { layout: 'block', gap: 'none' },
					children: [],
					locked: false,
					visible: true
				}
			}
		});

		expect(prompt).toContain('Workspace: Studio');
		expect(prompt).toContain('Component spec:');
		expect(prompt).toContain('Prefer reversible changes');
		expect(prompt).toContain('Allowed commands:');
	});
});
