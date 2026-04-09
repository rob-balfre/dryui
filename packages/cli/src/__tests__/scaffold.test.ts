import { describe, expect, test } from 'bun:test';
import { getAdd } from '../commands/add.js';

const mockSpec = {
	themeImports: {
		default: '@dryui/ui/themes/default.css',
		dark: '@dryui/ui/themes/dark.css'
	},
	components: {
		Card: {
			import: '@dryui/ui',
			description: 'Content surface',
			category: 'display',
			tags: ['surface'],
			compound: true,
			parts: {
				Root: { props: {} }
			},
			cssVars: {},
			dataAttributes: [],
			example: '<Card.Root>\n  <Card.Content>Body</Card.Content>\n</Card.Root>'
		}
	}
} as const;

describe('getAdd', () => {
	test('prints a starter snippet with theme imports when requested', () => {
		const { output, error, exitCode } = getAdd('Card', mockSpec, { withTheme: true });
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain("import '@dryui/ui/themes/default.css';");
		expect(output).toContain("import { Card } from '@dryui/ui';");
		expect(output).toContain('<Card.Root>');
	});

	test('supports subpath imports', () => {
		const { output } = getAdd('Card', mockSpec, { subpath: true });
		expect(output).toContain("import { Card } from '@dryui/ui/card';");
	});

	test('returns error for unknown component', () => {
		const { error, exitCode } = getAdd('Nonexistent', mockSpec);
		expect(exitCode).toBe(1);
		expect(error).toContain('Unknown component: "Nonexistent"');
	});
});
