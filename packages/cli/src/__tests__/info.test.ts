import { describe, expect, test } from 'bun:test';
import { findComponent, formatCompound, formatSimple, getInfo } from '../commands/info.js';

const mockSpec = {
	themeImports: {
		default: '@dryui/ui/themes/default.css',
		dark: '@dryui/ui/themes/dark.css'
	},
	components: {
		Button: {
			import: '@dryui/ui',
			description: 'Interactive button with variant and size styling',
			category: 'action',
			tags: ['form', 'action', 'click', 'submit'],
			compound: false,
			props: {
				variant: {
					type: "'solid' | 'outline' | 'ghost' | 'soft'",
					required: false,
					acceptedValues: ['solid', 'outline', 'ghost', 'soft']
				},
				size: {
					type: "'sm' | 'md' | 'lg'",
					required: false,
					acceptedValues: ['sm', 'md', 'lg']
				},
				disabled: { type: 'boolean', required: false },
				type: {
					type: "'button' | 'submit' | 'reset'",
					required: false,
					acceptedValues: ['button', 'submit', 'reset']
				}
			},
			forwardedProps: {
				baseType: 'HTMLButtonAttributes',
				via: 'rest',
				element: 'button',
				examples: ['type', 'disabled', 'name'],
				note: 'Forwards <button> attributes via rest props.'
			},
			cssVars: {
				'--dry-btn-bg': 'Background color',
				'--dry-btn-color': 'Text color',
				'--dry-btn-border': 'Border color'
			},
			dataAttributes: [{ name: 'data-disabled' }],
			example: '<Button variant="solid" onclick={handleClick}>Save</Button>'
		},
		Input: {
			import: '@dryui/ui',
			description: 'Text input with size variants',
			category: 'input',
			tags: ['form', 'text', 'input', 'field'],
			compound: false,
			props: {
				value: { type: 'string', required: false, bindable: true },
				size: {
					type: "'sm' | 'md' | 'lg'",
					required: false,
					acceptedValues: ['sm', 'md', 'lg']
				},
				disabled: { type: 'boolean', required: false }
			},
			forwardedProps: {
				baseType: 'HTMLInputAttributes',
				via: 'rest',
				element: 'input',
				examples: ['name', 'autocomplete', 'inputmode'],
				note: 'Forwards <input> attributes via rest props.'
			},
			cssVars: {
				'--dry-input-bg': 'Background color',
				'--dry-input-border': 'Border color'
			},
			dataAttributes: [{ name: 'data-disabled' }],
			example: '<Input type="email" bind:value={email} />'
		},
		Card: {
			import: '@dryui/ui',
			description: 'Content container with header and footer sections',
			category: 'display',
			tags: ['container', 'content', 'surface'],
			compound: true,
			structure: {
				tree: ['Card.Root', '  Card.Header', '  Card.Content', '  Card.Footer']
			},
			parts: {
				Root: {
					props: {},
					forwardedProps: {
						baseType: 'HTMLAttributes<HTMLDivElement>',
						via: 'rest',
						element: 'div',
						examples: ['id', 'style', 'role'],
						note: 'Forwards <div> attributes via rest props.'
					}
				},
				Header: { props: {} },
				Content: { props: {} },
				Footer: { props: {} }
			},
			cssVars: {
				'--dry-card-bg': 'Background color',
				'--dry-card-border': 'Border color',
				'--dry-card-radius': 'Border radius',
				'--dry-card-padding': 'Padding',
				'--dry-card-shadow': 'Box shadow'
			},
			dataAttributes: [] as const,
			example:
				'<Card.Root>\n  <Card.Header>Title</Card.Header>\n  <Card.Content>Body</Card.Content>\n  <Card.Footer><Button>Save</Button></Card.Footer>\n</Card.Root>'
		},
		Dialog: {
			import: '@dryui/ui',
			description: 'Modal dialog using native dialog element',
			category: 'overlay',
			tags: ['modal', 'overlay'],
			compound: true,
			structure: {
				tree: ['Dialog.Root', '  Dialog.Trigger', '  Dialog.Content'],
				note: 'Dialog.Content lives under Dialog.Root and pairs with Dialog.Trigger.'
			},
			parts: {
				Root: {
					props: { open: { type: 'boolean', required: false, bindable: true } },
					forwardedProps: {
						baseType: 'HTMLAttributes<HTMLDivElement>',
						via: 'rest',
						element: 'div',
						examples: ['id', 'style', 'role'],
						note: 'Forwards <div> attributes via rest props.'
					}
				},
				Trigger: {
					props: {},
					forwardedProps: {
						baseType: 'HTMLButtonAttributes',
						via: 'rest',
						element: 'button',
						examples: ['type', 'disabled', 'name'],
						note: 'Forwards <button> attributes via rest props.'
					}
				},
				Content: { props: {} }
			},
			cssVars: {
				'--dry-dialog-bg': 'Background color'
			},
			dataAttributes: [] as const,
			example:
				'<Dialog.Root bind:open={show}>\n  <Dialog.Content>Hello</Dialog.Content>\n</Dialog.Root>'
		}
	}
} as const;

describe('findComponent', () => {
	test('finds exact match', () => {
		const result = findComponent(mockSpec, 'Button');
		expect(result).not.toBeNull();
		if (result) expect(result.name).toBe('Button');
	});

	test('finds case-insensitive match', () => {
		const result = findComponent(mockSpec, 'button');
		expect(result).not.toBeNull();
		if (result) expect(result.name).toBe('Button');
	});

	test('returns null for unknown component', () => {
		const result = findComponent(mockSpec, 'Nonexistent');
		expect(result).toBeNull();
	});
});

describe('formatSimple', () => {
	test('includes accepted values and native props details', () => {
		const output = formatSimple('Button', mockSpec.components.Button);
		expect(output).toContain('accepted: solid, outline, ghost, soft');
		expect(output).toContain('Native props:');
		expect(output).toContain('Forwards <button> attributes via rest props.');
		expect(output).toContain('examples: type, disabled, name');
	});
});

describe('formatCompound', () => {
	test('includes structure guidance and part native props', () => {
		const output = formatCompound('Dialog', mockSpec.components.Dialog);
		expect(output).toContain('Required structure:');
		expect(output).toContain('Dialog.Root');
		expect(output).toContain('Dialog.Trigger');
		expect(output).toContain('note: Dialog.Content lives under Dialog.Root');
		expect(output).toContain('Forwards <button> attributes via rest props.');
	});
});

describe('getInfo — simple component', () => {
	test('returns correct output for Button', () => {
		const { output, error, exitCode } = getInfo('Button', mockSpec, 'text');
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('Button — Interactive button');
		expect(output).toContain("Root import: import { Button } from '@dryui/ui'");
		expect(output).not.toContain('Compound: yes');
	});

	test('shows bindable marker for bindable props', () => {
		const { output } = getInfo('Input', mockSpec, 'text');
		expect(output).toContain('value');
		expect(output).toContain('bindable');
	});
});

describe('getInfo — compound component', () => {
	test('returns correct output for Card', () => {
		const { output, error, exitCode } = getInfo('Card', mockSpec, 'text');
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('Kind: compound');
		expect(output).toContain('Use Card.Root, not Card');
		expect(output).toContain('Required structure:');
		expect(output).toContain('Card.Footer');
	});
});

describe('getInfo — unknown component', () => {
	test('returns error for unknown component', () => {
		const { output, error, exitCode } = getInfo('Nonexistent', mockSpec, 'text');
		expect(exitCode).toBe(1);
		expect(output).toBe('');
		expect(error).not.toBeNull();
		expect(error).toContain('Unknown component: "Nonexistent"');
	});
});
