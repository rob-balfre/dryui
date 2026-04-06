import { describe, test, expect } from 'bun:test';
import {
	generateDesignOutput,
	generateOutput,
	generateRearrangeOutput
} from '../../../packages/feedback/src/utils/output';
import type {
	Annotation,
	DesignPlacement,
	RearrangeState
} from '../../../packages/feedback/src/types';

function makeAnnotation(overrides: Partial<Annotation> = {}): Annotation {
	return {
		id: 'a1',
		x: 50,
		y: 100,
		isFixed: false,
		timestamp: Date.now(),
		element: 'button "Submit"',
		elementPath: 'form > button',
		comment: 'Change color to blue',
		kind: 'feedback',
		color: 'brand',
		...overrides
	};
}

describe('generateOutput', () => {
	test('compact format: numbered list with element and comment', () => {
		const output = generateOutput(
			[
				makeAnnotation(),
				makeAnnotation({ id: 'a2', element: 'input "Email"', comment: 'Make wider' })
			],
			'/page',
			'compact'
		);
		expect(output).toContain('## Page Feedback: /page');
		expect(output).toContain('1. button "Submit": Change color to blue');
		expect(output).toContain('2. input "Email": Make wider');
	});

	test('standard format: includes location and comment as sections', () => {
		const output = generateOutput([makeAnnotation()], '/page', 'standard');
		expect(output).toContain('## Page Feedback: /page');
		expect(output).toContain('**Viewport:**');
		expect(output).toContain('### 1. button "Submit"');
		expect(output).toContain('**Location:** form > button');
		expect(output).toContain('**Feedback:** Change color to blue');
	});

	test('standard format: includes svelte component when present', () => {
		const output = generateOutput(
			[makeAnnotation({ svelteComponent: 'App > Form > SubmitButton' })],
			'/page',
			'standard'
		);
		expect(output).toContain('**Svelte:** App > Form > SubmitButton');
	});

	test('standard format: includes source file when present', () => {
		const output = generateOutput(
			[makeAnnotation({ sourceFile: 'src/lib/Button.svelte:42' })],
			'/page',
			'standard'
		);
		expect(output).toContain('**Source:** src/lib/Button.svelte:42');
	});

	test('standard format: includes DryUI component when present', () => {
		const output = generateOutput(
			[makeAnnotation({ dryuiComponent: 'Button variant=solid tone=brand' })],
			'/page',
			'standard'
		);
		expect(output).toContain('**DryUI:** Button variant=solid tone=brand');
	});

	test('standard format: includes react component hierarchy when present', () => {
		const output = generateOutput(
			[makeAnnotation({ reactComponents: '<App> <Form> <SubmitButton>' })],
			'/page',
			'standard'
		);
		expect(output).toContain('**React:** <App> <Form> <SubmitButton>');
	});

	test('detailed format: includes CSS classes and bounding box', () => {
		const output = generateOutput(
			[
				makeAnnotation({
					cssClasses: 'btn btn-primary',
					boundingBox: { x: 10, y: 20, width: 100, height: 40 }
				})
			],
			'/page',
			'detailed'
		);
		expect(output).toContain('**Classes:** btn btn-primary');
		expect(output).toContain('**Bounding box:**');
	});

	test('forensic format: structures accessibility and nearby element metadata', () => {
		const output = generateOutput(
			[
				makeAnnotation({
					accessibility: 'role=button, aria-pressed=false, role=button',
					nearbyElements: 'span, input, span'
				})
			],
			'/page',
			'forensic'
		);
		expect(output).toContain('**Accessibility (2):**');
		expect(output).toContain('- role: button');
		expect(output).toContain('- aria-pressed: false');
		expect(output).toContain('**Nearby elements (2):**');
		expect(output).toContain('- span');
		expect(output).toContain('- input');
	});

	test('forensic format: enriches computed styles and full path metadata', () => {
		const output = generateOutput(
			[
				makeAnnotation({
					computedStyles: 'display:flex; gap:12px; justify-content:center; display:flex',
					fullPath: 'html > body > main > form > button.primary'
				})
			],
			'/page',
			'forensic'
		);

		expect(output).toContain('**Computed styles (3):**');
		expect(output).toContain('- display: flex');
		expect(output).toContain('- gap: 12px');
		expect(output).toContain('- justify-content: center');
		expect(output).toContain('**Full path:** html > body > main > form > button.primary');
		expect(output).toContain('**Path depth:** 5');
		expect(output).toContain('**Immediate parent:** form');
		expect(output).toContain('**Target node:** button.primary');
	});

	test('forensic format: includes resolution metadata when present', () => {
		const output = generateOutput(
			[
				makeAnnotation({
					status: 'resolved',
					resolvedAt: '2026-03-29T01:02:03.000Z',
					resolvedBy: 'agent',
					resolutionNote: 'Adjusted the button contrast tokens.'
				})
			],
			'/page',
			'forensic'
		);

		expect(output).toContain('**Status:** resolved');
		expect(output).toContain('**Resolved at:** 2026-03-29T01:02:03.000Z');
		expect(output).toContain('**Resolved by:** agent');
		expect(output).toContain('**Resolution note:** Adjusted the button contrast tokens.');
	});

	test('includes page path in header', () => {
		const output = generateOutput([makeAnnotation()], '/dashboard', 'compact');
		expect(output).toContain('/dashboard');
	});

	test('returns empty message for no annotations', () => {
		const output = generateOutput([], '/page', 'compact');
		expect(output).toBe('');
	});

	test('appends design layout output when placements are provided', () => {
		const placements: DesignPlacement[] = [
			{
				id: 'dp-1',
				type: 'navigation',
				x: 12,
				y: 20,
				width: 960,
				height: 64,
				scrollY: 0,
				timestamp: Date.now()
			}
		];

		const output = generateOutput([], '/page', 'standard', {
			designPlacements: placements,
			blankCanvas: true,
			wireframePurpose: 'Sketch a new homepage'
		});

		expect(output).toContain('Wireframe: New Page');
		expect(output).toContain('Sketch a new homepage');
		expect(output).toContain('standalone wireframe');
		expect(output).toContain('rough sketch for exploring ideas');
		expect(output).toContain('navigation');
	});

	test('appends rearrange output when sections move', () => {
		const rearrangeState: RearrangeState = {
			detectedAt: Date.now(),
			originalOrder: ['hero'],
			sections: [
				{
					id: 'hero',
					label: 'Hero',
					tagName: 'section',
					selector: 'main > section:nth-child(1)',
					role: null,
					className: 'hero',
					textSnippet: 'Welcome',
					note: 'Shift the hero content above the fold',
					originalRect: { x: 0, y: 100, width: 800, height: 300 },
					currentRect: { x: 0, y: 160, width: 800, height: 340 },
					originalIndex: 0
				}
			]
		};

		const output = generateOutput([], '/page', 'standard', { rearrangeState });
		expect(output).toContain('Suggested Layout Changes');
		expect(output).toContain('Hero');
		expect(output).toContain('Shift the hero content above the fold');
		expect(output).toContain('Suggested: 800x340 at (0, 160)');
	});
});

describe('generateDesignOutput', () => {
	test('returns empty string when there is no layout content', () => {
		expect(generateDesignOutput([], 'standard')).toBe('');
	});

	test('formats compact placement output', () => {
		const output = generateDesignOutput(
			[
				{
					id: 'dp-1',
					type: 'hero',
					x: 40,
					y: 140,
					width: 960,
					height: 420,
					scrollY: 0,
					timestamp: Date.now()
				}
			],
			'compact'
		);

		expect(output).toContain('Design Layout');
		expect(output).toContain('Hero');
	});

	test('includes placement note in detailed layout output', () => {
		const output = generateDesignOutput(
			[
				{
					id: 'dp-1',
					type: 'hero',
					x: 40,
					y: 140,
					width: 960,
					height: 420,
					scrollY: 0,
					timestamp: Date.now(),
					note: 'Raise the hero above the fold'
				}
			],
			'detailed'
		);

		expect(output).toContain('Raise the hero above the fold');
		expect(output).toContain('Suggested Implementation');
	});

	test('includes css suggestions when the layout implies specific css structure', () => {
		const output = generateDesignOutput(
			[
				{
					id: 'dp-1',
					type: 'navigation',
					x: 0,
					y: 0,
					width: 1100,
					height: 64,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-2',
					type: 'card',
					x: 40,
					y: 120,
					width: 320,
					height: 240,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-3',
					type: 'card',
					x: 400,
					y: 120,
					width: 320,
					height: 240,
					scrollY: 0,
					timestamp: Date.now()
				}
			],
			'detailed'
		);

		expect(output).toContain('DryUI Layout Primitives');
		expect(output).toContain('Use a sticky `<nav>` for top-of-page chrome.');
		expect(output).toContain('grid-template-columns: repeat(2, 320px); gap: 16px;');
	});

	test('includes row analysis and suggested implementation in standard layout output', () => {
		const output = generateDesignOutput(
			[
				{
					id: 'dp-1',
					type: 'navigation',
					x: 0,
					y: 0,
					width: 1100,
					height: 64,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-2',
					type: 'hero',
					x: 80,
					y: 120,
					width: 960,
					height: 420,
					scrollY: 0,
					timestamp: Date.now()
				}
			],
			'standard'
		);

		expect(output).toContain('Layout Analysis');
		expect(output).toContain('Row 1');
		expect(output).toContain('Suggested Implementation');
		expect(output).not.toContain('Navbar');
		expect(output).toContain('Start from a hero-sections block variant');
	});

	test('includes spacing, pairwise gaps, and z-order in forensic layout output', () => {
		const output = generateDesignOutput(
			[
				{
					id: 'dp-1',
					type: 'navigation',
					x: 0,
					y: 0,
					width: 1100,
					height: 64,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-2',
					type: 'card',
					x: 40,
					y: 120,
					width: 320,
					height: 240,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-3',
					type: 'card',
					x: 400,
					y: 120,
					width: 320,
					height: 240,
					scrollY: 0,
					timestamp: Date.now()
				}
			],
			'forensic'
		);

		expect(output).toContain('Spacing & Gaps');
		expect(output).toContain('All Pairwise Gaps');
		expect(output).toContain('Z-Order (placement order)');
	});
});

describe('generateRearrangeOutput', () => {
	test('returns empty string when nothing changed', () => {
		const state: RearrangeState = {
			detectedAt: Date.now(),
			originalOrder: ['hero'],
			sections: [
				{
					id: 'hero',
					label: 'Hero',
					tagName: 'section',
					selector: 'main > section:nth-child(1)',
					role: null,
					className: 'hero',
					textSnippet: 'Welcome',
					originalRect: { x: 0, y: 100, width: 800, height: 300 },
					currentRect: { x: 0, y: 100, width: 800, height: 300 },
					originalIndex: 0
				}
			]
		};

		expect(generateRearrangeOutput(state, 'standard')).toBe('');
	});

	test('includes layout summary and section snapshot for standard rearrange output', () => {
		const state: RearrangeState = {
			detectedAt: Date.now(),
			originalOrder: ['header', 'hero'],
			sections: [
				{
					id: 'header',
					label: 'Header',
					tagName: 'header',
					selector: 'header',
					role: 'banner',
					className: 'site-header',
					textSnippet: 'Docs',
					originalRect: { x: 0, y: 0, width: 1200, height: 80 },
					currentRect: { x: 0, y: 24, width: 1200, height: 80 },
					originalIndex: 0
				},
				{
					id: 'hero',
					label: 'Hero',
					tagName: 'section',
					selector: 'main > section:first-child',
					role: null,
					className: 'hero',
					textSnippet: 'Welcome',
					originalRect: { x: 0, y: 120, width: 960, height: 320 },
					currentRect: { x: 0, y: 120, width: 960, height: 360 },
					originalIndex: 1
				}
			]
		};

		const output = generateRearrangeOutput(state, 'standard');
		expect(output).toContain('Suggested Layout Changes');
		expect(output).toContain('Layout Summary');
		expect(output).toContain('All Sections (current positions)');
		expect(output).toContain('Header');
		expect(output).toContain('Hero');
	});
});
