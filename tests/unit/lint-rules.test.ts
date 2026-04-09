import { describe, test, expect } from 'bun:test';
import { checkScript, checkMarkup, checkStyle } from '../../packages/lint/src/rules.js';

describe('checkScript', () => {
	test('flags Grid import from @dryui/ui', () => {
		const violations = checkScript("import { Grid } from '@dryui/ui';");
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
		expect(violations[0]!.message).toContain('Grid');
	});

	test('flags Stack import from subpath', () => {
		const violations = checkScript("import { Stack } from '@dryui/ui/stack';");
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags Flex import from subpath', () => {
		const violations = checkScript("import { Flex } from '@dryui/ui/flex';");
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags multiple layout imports on one line', () => {
		const violations = checkScript("import { Grid, Stack, Button } from '@dryui/ui';");
		expect(violations).toHaveLength(2);
	});

	test('ignores non-layout imports', () => {
		const violations = checkScript("import { Button } from '@dryui/ui';");
		expect(violations).toHaveLength(0);
	});
});

describe('checkMarkup', () => {
	test('flags style attribute', () => {
		const violations = checkMarkup('<div style="color: red">hello</div>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-inline-style');
	});

	test('flags style: directive', () => {
		const violations = checkMarkup('<div style:color="red">hello</div>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-style-directive');
	});

	test('flags <Grid component', () => {
		const violations = checkMarkup('<Grid columns={3}><div>child</div></Grid>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags <Stack component', () => {
		const violations = checkMarkup('<Stack gap="md"><div>child</div></Stack>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags <Flex component', () => {
		const violations = checkMarkup('<Flex><div>child</div></Flex>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags compound component usage <Stack.Root', () => {
		const violations = checkMarkup('<Stack.Root><div>child</div></Stack.Root>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('ignores non-layout components', () => {
		const violations = checkMarkup('<Button>click</Button>');
		expect(violations).toHaveLength(0);
	});

	test('ignores regular HTML elements', () => {
		const violations = checkMarkup('<div class="grid"><span>text</span></div>');
		expect(violations).toHaveLength(0);
	});

	test('flags class= on a component', () => {
		const violations = checkMarkup('<Button class="my-btn">click</Button>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
		expect(violations[0]!.message).toContain('Button');
	});

	test('flags class= on a compound component', () => {
		const violations = checkMarkup('<Card.Root class="custom">content</Card.Root>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
		expect(violations[0]!.message).toContain('Card.Root');
	});

	test('flags class= with single quotes on a component', () => {
		const violations = checkMarkup("<Alert class='wide'>warning</Alert>");
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
	});

	test('flags class= with expression on a component', () => {
		const violations = checkMarkup('<Badge class={styles.tag}>new</Badge>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
	});

	test('flags class= on multi-line component tag', () => {
		const code = `<Button
  variant="primary"
  class="extra"
>click</Button>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
		expect(violations[0]!.line).toBe(1);
	});

	test('does not flag class= on HTML elements', () => {
		const violations = checkMarkup('<div class="wrapper"><p class="text">hi</p></div>');
		expect(violations).toHaveLength(0);
	});

	test('does not flag class= inside script block', () => {
		const code = `<script>
  const cls = 'class="foo"';
</script>
<Button>click</Button>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(0);
	});

	test('flags svelte-ignore css_unused_selector comment', () => {
		const code = `<!-- svelte-ignore css_unused_selector -->
<style>
  .foo { color: red; }
</style>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-css-ignore');
		expect(violations[0]!.line).toBe(1);
	});

	test('flags svelte-ignore css_unused_selector with extra whitespace', () => {
		const violations = checkMarkup('<!--  svelte-ignore  css_unused_selector  -->');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-css-ignore');
	});

	test('flags multiple svelte-ignore css_unused_selector comments', () => {
		const code = `<!-- svelte-ignore css_unused_selector -->
<div>content</div>
<!-- svelte-ignore css_unused_selector -->`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(2);
		expect(violations[0]!.rule).toBe('dryui/no-css-ignore');
		expect(violations[1]!.rule).toBe('dryui/no-css-ignore');
	});

	test('does not flag other svelte-ignore comments', () => {
		const violations = checkMarkup('<!-- svelte-ignore a11y-click-events-have-key-events -->');
		expect(violations).toHaveLength(0);
	});

	test('does not flag svelte-ignore css_unused_selector inside script block', () => {
		const code = `<script>
  // <!-- svelte-ignore css_unused_selector -->
  const x = '<!-- svelte-ignore css_unused_selector -->';
</script>
<div>clean</div>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(0);
	});
});

describe('checkStyle', () => {
	test('flags display: flex', () => {
		const violations = checkStyle('.foo { display: flex; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('flags display:flex without space', () => {
		const violations = checkStyle('.foo { display:flex; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('allows display: inline-flex', () => {
		const violations = checkStyle('.foo { display: inline-flex; }');
		expect(violations).toHaveLength(0);
	});

	test('flags flex-direction', () => {
		const violations = checkStyle('.foo { flex-direction: column; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('flags flex-wrap', () => {
		const violations = checkStyle('.foo { flex-wrap: wrap; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('flags flex-grow', () => {
		const violations = checkStyle('.foo { flex-grow: 1; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('flags flex-shrink', () => {
		const violations = checkStyle('.foo { flex-shrink: 0; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('flags flex-basis', () => {
		const violations = checkStyle('.foo { flex-basis: auto; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('flags flex shorthand', () => {
		const violations = checkStyle('.foo { flex: 1 1 auto; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-flex');
	});

	test('allows justify-content (valid in grid)', () => {
		const violations = checkStyle('.foo { justify-content: center; }');
		expect(violations).toHaveLength(0);
	});

	test('allows align-content (valid in grid)', () => {
		const violations = checkStyle('.foo { align-content: stretch; }');
		expect(violations).toHaveLength(0);
	});

	test('flags width with any value', () => {
		const violations = checkStyle('.foo { width: 300px; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags width: 100%', () => {
		const violations = checkStyle('.foo { width: 100%; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags inline-size', () => {
		const violations = checkStyle('.foo { inline-size: 100%; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags max-width', () => {
		const violations = checkStyle('.foo { max-width: 100%; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags min-width', () => {
		const violations = checkStyle('.foo { min-width: 100%; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags max-inline-size', () => {
		const violations = checkStyle('.foo { max-inline-size: 66%; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags min-inline-size', () => {
		const violations = checkStyle('.foo { min-inline-size: 10rem; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('allows custom property --dry-width', () => {
		const violations = checkStyle('.foo { --dry-width: 100%; }');
		expect(violations).toHaveLength(0);
	});

	test('flags :global() selector', () => {
		const violations = checkStyle('.fare-header :global(span) { text-align: center; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-global');
	});

	test('flags :global() with class selector', () => {
		const violations = checkStyle(':global(.active) { color: red; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-global');
	});

	test('flags multiple :global() usages', () => {
		const violations = checkStyle(
			'.a :global(span) { color: red; }\n.b :global(.foo) { color: blue; }'
		);
		expect(violations).toHaveLength(2);
	});

	test('flags @media for sizing', () => {
		const violations = checkStyle('@media (max-width: 768px) { .foo { color: red; } }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-media-sizing');
	});

	test('flags @media screen', () => {
		const violations = checkStyle('@media screen and (min-width: 1024px) { .foo { gap: 2rem; } }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-media-sizing');
	});

	test('allows @media prefers-reduced-motion', () => {
		const violations = checkStyle(
			'@media (prefers-reduced-motion: reduce) { .foo { animation: none; } }'
		);
		expect(violations).toHaveLength(0);
	});

	test('allows @media prefers-color-scheme', () => {
		const violations = checkStyle('@media (prefers-color-scheme: dark) { .foo { color: white; } }');
		expect(violations).toHaveLength(0);
	});

	test('allows display: grid', () => {
		const violations = checkStyle('.foo { display: grid; }');
		expect(violations).toHaveLength(0);
	});

	test('allows grid properties', () => {
		const violations = checkStyle(
			'.foo { grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center; }'
		);
		expect(violations).toHaveLength(0);
	});

	test('allows @container queries', () => {
		const violations = checkStyle('@container (max-width: 36rem) { .foo { --columns: 1fr; } }');
		expect(violations).toHaveLength(0);
	});

	test('allows display: flex with dryui-allow flex comment', () => {
		const violations = checkStyle('/* dryui-allow flex */\n.foo { display: flex; }');
		expect(violations).toHaveLength(0);
	});

	test('allows flex-direction with dryui-allow flex comment', () => {
		const violations = checkStyle('/* dryui-allow flex */\nflex-direction: row;');
		expect(violations).toHaveLength(0);
	});
});
