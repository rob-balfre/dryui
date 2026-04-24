import { describe, test, expect } from 'bun:test';
import {
	checkScript,
	checkMarkup,
	checkStyle,
	checkSvelteFile,
	fixThemeImportOrder
} from './rules.js';

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

	test('does not flag class= on Button (officially supported)', () => {
		const violations = checkMarkup('<Button class="my-btn" color="ink">click</Button>');
		expect(violations).toHaveLength(0);
	});

	test('does not flag class= on Heading/Text (officially supported)', () => {
		const violations = checkMarkup('<Heading class="hero">Title</Heading>');
		expect(violations).toHaveLength(0);
		const violationsText = checkMarkup('<Text class="lede">Body copy</Text>');
		expect(violationsText).toHaveLength(0);
	});

	test('does not flag class= on multi-line Button tag', () => {
		const code = `<Button
  variant="solid"
  color="ink"
  class="extra"
>click</Button>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(0);
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

	test('flags raw anchor without href', () => {
		const violations = checkMarkup('<a onclick={handleClick}>Apply preset</a>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-anchor-without-href');
		expect(violations[0]!.message).toContain('Use <button> for actions');
	});

	test('allows raw anchor with href expression', () => {
		const violations = checkMarkup('<a href={destination}>Open docs</a>');
		expect(violations).toHaveLength(0);
	});

	test('allows raw anchor with href shorthand', () => {
		const violations = checkMarkup('<a {href}>Open docs</a>');
		expect(violations).toHaveLength(0);
	});

	test('does not flag anchor markup inside comments', () => {
		const violations = checkMarkup('<!-- <a onclick={noop}>Ignore me</a> -->');
		expect(violations).toHaveLength(0);
	});

	test('flags raw native element when file is not in canonical directory', () => {
		const violations = checkMarkup(
			'<button type="button">click</button>',
			'src/avatar/avatar.svelte'
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-raw-native-element');
		expect(violations[0]!.message).toContain('<Button>');
	});

	test('flags raw button even when filename contains "button" but dir does not match', () => {
		const violations = checkMarkup(
			'<button type="button">click</button>',
			'src/toolbar/toolbar-button.svelte'
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-raw-native-element');
	});

	test('allows raw native element when file is in canonical directory', () => {
		const violations = checkMarkup(
			'<button type="button">click</button>',
			'src/button/button.svelte'
		);
		expect(violations).toHaveLength(0);
	});

	test('allows raw input in file-select internals', () => {
		const violations = checkMarkup(
			'<input type="file" />',
			'src/file-select/file-select-root.svelte'
		);
		expect(violations).toHaveLength(0);
	});

	test('flags raw button in non-canonical directories even if input-like', () => {
		const violations = checkMarkup(
			'<button type="button">−</button>',
			'src/number-input/number-input.svelte'
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-raw-native-element');
	});

	test('allows raw dialog when file is in dialog directory', () => {
		const violations = checkMarkup('<dialog open></dialog>', 'src/dialog/dialog-content.svelte');
		expect(violations).toHaveLength(0);
	});

	test('flags raw separator candidate when file is not in separator directory', () => {
		const violations = checkMarkup('<hr />', 'src/layout/section-divider.svelte');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-raw-native-element');
		expect(violations[0]!.message).toContain('<Separator />');
	});

	test('error message references canonical directory not filename', () => {
		const violations = checkMarkup('<button>x</button>', 'src/toast/toast-action.svelte');
		expect(violations[0]!.message).toContain('canonical component directory');
	});

	test('flags raw table outside table/data-grid directories', () => {
		const violations = checkMarkup('<table></table>', 'src/report/report-view.svelte');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.message).toContain('<Table>');
	});

	test('allows raw table in data-grid directory', () => {
		const violations = checkMarkup('<table></table>', 'src/data-grid/data-grid-table.svelte');
		expect(violations).toHaveLength(0);
	});

	test('flags raw textarea outside textarea/prompt-input directories', () => {
		const violations = checkMarkup('<textarea></textarea>', 'src/form/form-message.svelte');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.message).toContain('<Textarea>');
	});

	test('allows raw textarea in prompt-input directory', () => {
		const violations = checkMarkup('<textarea></textarea>', 'src/prompt-input/prompt-input.svelte');
		expect(violations).toHaveLength(0);
	});

	test('flags raw select outside select/input-group/phone-input', () => {
		const violations = checkMarkup('<select></select>', 'src/filter/filter-panel.svelte');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.message).toContain('<Select>');
	});

	test('allows raw select in phone-input directory', () => {
		const violations = checkMarkup(
			'<select></select>',
			'src/phone-input/phone-input-country.svelte'
		);
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

	test('flags <svelte:element> with dynamic tag', () => {
		const violations = checkMarkup('<svelte:element this={as}>content</svelte:element>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-svelte-element');
		expect(violations[0]!.message).toContain('<svelte:element');
	});

	test('flags self-closing <svelte:element>', () => {
		const violations = checkMarkup('<svelte:element this={tag} />');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-svelte-element');
	});

	test('flags multiple <svelte:element> occurrences', () => {
		const code = `<svelte:element this={a}>x</svelte:element>
<svelte:element this={b}>y</svelte:element>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(2);
		expect(violations[0]!.rule).toBe('dryui/no-svelte-element');
		expect(violations[1]!.rule).toBe('dryui/no-svelte-element');
	});

	test('allows <svelte:element> with dryui-allow comment', () => {
		const code = `<!-- dryui-allow svelte-element: h1–h6 share UA styles -->
<svelte:element this={tag}>heading</svelte:element>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(0);
	});

	test('does not flag <svelte:element> inside script string', () => {
		const code = `<script>
  const s = '<svelte:element this={x}>';
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

	test('allows max-width in ch (typographic measure)', () => {
		const violations = checkStyle('.prose { max-width: 55ch; }');
		expect(violations).toHaveLength(0);
	});

	test('allows max-width in em', () => {
		const violations = checkStyle('.prose { max-width: 44em; }');
		expect(violations).toHaveLength(0);
	});

	test('allows max-width in ex', () => {
		const violations = checkStyle('.prose { max-width: 110ex; }');
		expect(violations).toHaveLength(0);
	});

	test('allows max-inline-size in ch', () => {
		const violations = checkStyle('.prose { max-inline-size: 70ch; }');
		expect(violations).toHaveLength(0);
	});

	test('allows min-width: 12ch', () => {
		const violations = checkStyle('.foo { min-width: 12ch; }');
		expect(violations).toHaveLength(0);
	});

	test('flags max-width: 400px (freezes at pixel breakpoint)', () => {
		const violations = checkStyle('.foo { max-width: 400px; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('flags mixed calc with pixel and ch', () => {
		// Mixed values still freeze layout since the pixel term dominates.
		const violations = checkStyle('.foo { max-width: calc(55ch + 20px); }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-width');
	});

	test('no-width message surfaces allowed units for typographic measure', () => {
		const violations = checkStyle('.foo { max-width: 400px; }');
		expect(violations[0]!.message).toContain('ch, ex, em');
	});

	test('flags all: unset', () => {
		const violations = checkStyle('.foo { all: unset; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-all-unset');
	});

	test('allows other all property values', () => {
		const violations = checkStyle('.foo { all: inherit; }');
		expect(violations).toHaveLength(0);
	});

	test('flags !important declaration', () => {
		const violations = checkStyle('.foo { color: red !important; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-important');
		expect(violations[0]!.message).toContain('!important');
	});

	test('flags !important without space', () => {
		const violations = checkStyle('.foo { color: red!important; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-important');
	});

	test('allows property without !important', () => {
		const violations = checkStyle('.foo { color: red; }');
		expect(violations).toHaveLength(0);
	});

	test('does not flag !important inside a CSS comment', () => {
		const violations = checkStyle('.foo { /* !important would be bad */ color: red; }');
		expect(violations).toHaveLength(0);
	});

	test('does not flag !important inside a multi-line CSS comment', () => {
		const code = `/*
 * Avoid using !important
 * in this file.
 */
.foo { color: red; }`;
		const violations = checkStyle(code);
		expect(violations).toHaveLength(0);
	});

	test('flags !important even when a comment also contains !important', () => {
		const code = `/* no !important below please */
.foo { color: red !important; }`;
		const violations = checkStyle(code);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-important');
		expect(violations[0]!.line).toBe(2);
	});

	test('allows !important with dryui-allow important comment', () => {
		const violations = checkStyle('/* dryui-allow important */\n.foo { color: red !important; }');
		expect(violations).toHaveLength(0);
	});

	test('flags multiple !important occurrences', () => {
		const code = `.foo { color: red !important; }
.bar { margin: 0 !important; }`;
		const violations = checkStyle(code);
		const important = violations.filter((v) => v.rule === 'dryui/no-important');
		expect(important).toHaveLength(2);
		expect(important[0]!.line).toBe(1);
		expect(important[1]!.line).toBe(2);
	});

	test('does not flag !important inside a script block via checkScript', () => {
		const violations = checkScript("const css = 'color: red !important';");
		expect(violations.filter((v) => v.rule === 'dryui/no-important')).toHaveLength(0);
	});

	test('does not flag !important inside markup (checkMarkup strips style blocks)', () => {
		const code = `<div>color: red !important in text</div>
<style>.foo { color: blue; }</style>`;
		const violations = checkMarkup(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-important')).toHaveLength(0);
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

	test('flags outline: 2px solid var(--dry-color-focus-ring) literal', () => {
		const violations = checkStyle(
			'.foo:focus-visible { outline: 2px solid var(--dry-color-focus-ring); outline-offset: 2px; }'
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/prefer-focus-ring-token');
	});

	test('allows outline: var(--dry-focus-ring) shorthand', () => {
		const violations = checkStyle(
			'.foo:focus-visible { outline: var(--dry-focus-ring); outline-offset: 2px; }'
		);
		expect(violations).toHaveLength(0);
	});

	test('flags box-shadow: inset 2px 0 0 <color> (left rail)', () => {
		const violations = checkStyle('.foo { box-shadow: inset 2px 0 0 blue; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-partial-inset-shadow');
	});

	test('flags box-shadow: inset 0 -1px 0 <color> (bottom rail)', () => {
		const violations = checkStyle('.foo { box-shadow: inset 0 -1px 0 red; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-partial-inset-shadow');
	});

	test('flags box-shadow: inset -2px 0 0 <color> (right rail)', () => {
		const violations = checkStyle('.foo { box-shadow: inset -2px 0 0 blue; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-partial-inset-shadow');
	});

	test('flags directional inset with blur omitted (inset 2px 0 <color>)', () => {
		const violations = checkStyle('.foo { box-shadow: inset 2px 0 blue; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-partial-inset-shadow');
	});

	test('allows uniform inset ring (inset 0 0 0 1px)', () => {
		const violations = checkStyle('.foo { box-shadow: inset 0 0 0 1px blue; }');
		expect(violations).toHaveLength(0);
	});

	test('allows diagonal inset shadow with blur (inset 2px 2px 4px)', () => {
		const violations = checkStyle('.foo { box-shadow: inset 2px 2px 4px rgba(0,0,0,0.2); }');
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
	});

	test('allows soft inner glow with blur only (inset 0 0 4px)', () => {
		const violations = checkStyle('.foo { box-shadow: inset 0 0 4px red; }');
		expect(violations).toHaveLength(0);
	});

	test('allows non-inset drop shadow (0 1px 0 red)', () => {
		const violations = checkStyle('.foo { box-shadow: 0 1px 0 red; }');
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
	});

	test('allows partial inset with dryui-allow inset-shadow comment', () => {
		const violations = checkStyle(
			'/* dryui-allow inset-shadow */\n.foo { box-shadow: inset 2px 0 0 blue; }'
		);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
	});

	test('allows partial inset when comment sits above a multi-line box-shadow', () => {
		const code = [
			'.foo {',
			'\t/* dryui-allow inset-shadow */',
			'\tbox-shadow:',
			'\t\tinset 0 1px 0 white,',
			'\t\tinset 0 -1px 0 black;',
			'}'
		].join('\n');
		const violations = checkStyle(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
	});

	test('rejects allow comment that is gated by an intervening declaration terminator', () => {
		const code = [
			'.foo {',
			'\t/* dryui-allow inset-shadow */',
			'\tcolor: red;',
			'\tbox-shadow: inset 2px 0 0 blue;',
			'}'
		].join('\n');
		const violations = checkStyle(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(1);
	});

	test('rejects allow comment that sits outside the rule block', () => {
		const code = [
			'/* dryui-allow inset-shadow */',
			'.foo {',
			'\tbox-shadow: inset 2px 0 0 blue;',
			'}'
		].join('\n');
		const violations = checkStyle(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(1);
	});

	test('does not let a trailing CSS comment hide a previous declaration terminator', () => {
		const code = [
			'.foo {',
			'\t/* dryui-allow inset-shadow */',
			'\tcolor: red; /* primary brand */',
			'\tbox-shadow: inset 2px 0 0 blue;',
			'}'
		].join('\n');
		const violations = checkStyle(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(1);
	});

	test('allows multi-line flex declaration with comment above the property', () => {
		const code = ['.foo {', '\t/* dryui-allow flex */', '\tdisplay:', '\t\tflex;', '}'].join('\n');
		const violations = checkStyle(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-flex')).toHaveLength(0);
	});

	test('allows partial inset with inline allow comment on the same line as the violation', () => {
		const code = [
			'.foo {',
			'\tbox-shadow:',
			'\t\t0 22px 48px black,',
			'\t\t/* dryui-allow inset-shadow */ inset 0 1px 0 white;',
			'}'
		].join('\n');
		const violations = checkStyle(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
	});

	test('inline allow comment only covers the value that follows it', () => {
		const code =
			'.foo { box-shadow: inset 2px 0 0 red, /* dryui-allow inset-shadow */ inset 0 -1px 0 black; }';
		const violations = checkStyle(code);
		// The first inset has no allow before it; the second one does.
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(1);
	});

	test('flags inset rail with color-mix color value', () => {
		const violations = checkStyle(
			'.foo { box-shadow: inset 0 -1px 0 color-mix(in srgb, black 10%, transparent); }'
		);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(1);
	});
});

describe('checkSvelteFile', () => {
	test('merges script, markup, and style violations with file-relative lines', () => {
		const code = [
			'<script>',
			"\timport { Grid } from '@dryui/ui';",
			'</script>',
			'',
			'<div style="color: red">hello</div>',
			'',
			'<style>',
			'\t.foo { width: 100%; }',
			'</style>'
		].join('\n');

		const violations = checkSvelteFile(code, 'src/example.svelte');

		expect(violations).toHaveLength(3);
		expect(violations.map((violation) => violation.rule)).toEqual([
			'dryui/no-layout-component',
			'dryui/no-inline-style',
			'dryui/no-width'
		]);
		expect(violations.map((violation) => violation.line)).toEqual([2, 5, 8]);
	});
});

describe('no-flex carve-out for ChipGroup', () => {
	test('flex inside data-chip-group root element is allowed', () => {
		const code = [
			'<div class="chip-group" data-chip-group>',
			'  <span class="chip">one</span>',
			'  <span class="chip">two</span>',
			'</div>',
			'',
			'<style>',
			'  .chip-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }',
			'</style>'
		].join('\n');
		const violations = checkSvelteFile(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-flex')).toHaveLength(0);
	});

	test('flex on a direct child of a data-chip-group element is allowed', () => {
		const code = [
			'<div class="chip-group" data-chip-group>',
			'  <span class="chip">one</span>',
			'  <span class="chip">two</span>',
			'</div>',
			'',
			'<style>',
			'  .chip { display: flex; align-items: center; }',
			'</style>'
		].join('\n');
		const violations = checkSvelteFile(code);
		expect(violations.filter((v) => v.rule === 'dryui/no-flex')).toHaveLength(0);
	});

	test('flex elsewhere still fails', () => {
		const code = [
			'<div class="chip-group" data-chip-group>',
			'  <span class="chip">one</span>',
			'</div>',
			'<div class="other">x</div>',
			'',
			'<style>',
			'  .chip-group { display: flex; }',
			'  .other { display: flex; }',
			'</style>'
		].join('\n');
		const violations = checkSvelteFile(code);
		const flexViolations = violations.filter((v) => v.rule === 'dryui/no-flex');
		expect(flexViolations).toHaveLength(1);
		// .other should trigger, .chip-group should not
		expect(flexViolations[0]!.message).toContain('display: flex');
	});

	test('[data-chip-group] attribute selector in CSS is always exempt', () => {
		// Even without markup context, [data-chip-group] is the compound component's
		// root marker, so flex on it is intentional.
		const violations = checkStyle('[data-chip-group] { display: flex; }');
		expect(violations.filter((v) => v.rule === 'dryui/no-flex')).toHaveLength(0);
	});

	test('no-flex message mentions ChipGroup.Root', () => {
		const violations = checkStyle('.foo { display: flex; }');
		expect(violations[0]!.message).toContain('ChipGroup.Root');
		expect(violations[0]!.message).toContain('chip row');
	});

	test('block comments before [data-chip-group] do not smuggle flex-wrap text into the scan', () => {
		// Regression: ChipGroup.Root ships a docstring mentioning "flex-wrap" above
		// the [data-chip-group] rule. Without comment-stripping, the word "flex-wrap"
		// inside the comment got flagged as a property violation.
		const css = [
			'/*',
			' * ChipGroup wraps tag clusters.',
			' * This is the sanctioned home for flex-wrap.',
			' */',
			'[data-chip-group] {',
			'  display: flex;',
			'  flex-wrap: wrap;',
			'}'
		].join('\n');
		expect(checkStyle(css).filter((v) => v.rule === 'dryui/no-flex')).toHaveLength(0);
	});
});

describe('theme-import-order', () => {
	test('local CSS before theme CSS → error', () => {
		const code = [
			"import '../app.css';",
			"import '@dryui/ui/themes/default.css';",
			"import '@dryui/ui/themes/dark.css';"
		].join('\n');
		const violations = checkScript(code);
		const order = violations.filter((v) => v.rule === 'project/theme-import-order');
		expect(order).toHaveLength(1);
		expect(order[0]!.line).toBe(1);
	});

	test('theme CSS before local CSS → no error', () => {
		const code = [
			"import '@dryui/ui/themes/default.css';",
			"import '@dryui/ui/themes/dark.css';",
			"import '../app.css';"
		].join('\n');
		const violations = checkScript(code);
		expect(violations.filter((v) => v.rule === 'project/theme-import-order')).toHaveLength(0);
	});

	test('only theme CSS imported → no error', () => {
		const code = [
			"import '@dryui/ui/themes/default.css';",
			"import '@dryui/ui/themes/dark.css';"
		].join('\n');
		const violations = checkScript(code);
		expect(violations.filter((v) => v.rule === 'project/theme-import-order')).toHaveLength(0);
	});

	test('only local CSS imported → no error', () => {
		const code = "import '../app.css';";
		const violations = checkScript(code);
		expect(violations.filter((v) => v.rule === 'project/theme-import-order')).toHaveLength(0);
	});

	test('wrong order error message surfaces ask recipe steer', () => {
		const code = ["import '../app.css';", "import '@dryui/ui/themes/default.css';"].join('\n');
		const violations = checkScript(code);
		const msg = violations.find((v) => v.rule === 'project/theme-import-order')!.message;
		expect(msg).toContain('customize tokens');
	});

	test('+layout.svelte script block surfaces theme-import-order', () => {
		const code = [
			'<script>',
			"  import '../app.css';",
			"  import '@dryui/ui/themes/default.css';",
			"  import '@dryui/ui/themes/dark.css';",
			'</script>',
			'<main>hello</main>'
		].join('\n');
		const violations = checkSvelteFile(code, 'src/routes/+layout.svelte');
		const order = violations.filter((v) => v.rule === 'project/theme-import-order');
		expect(order).toHaveLength(1);
		// The Svelte file offsets from the script start line, so '../app.css' is
		// on line 2 of the file.
		expect(order[0]!.line).toBe(2);
	});

	test('fixThemeImportOrder reorders imports theme-first', () => {
		const input = [
			"import '../app.css';",
			"import '@dryui/ui/themes/default.css';",
			"import '@dryui/ui/themes/dark.css';"
		].join('\n');
		const fixed = fixThemeImportOrder(input);
		// The theme imports now precede the local CSS import.
		const themeIdx = fixed.indexOf('@dryui/ui/themes/default.css');
		const localIdx = fixed.indexOf('../app.css');
		expect(themeIdx).toBeLessThan(localIdx);
		// No duplication of imports.
		expect(fixed.match(/@dryui\/ui\/themes\/default\.css/g)!.length).toBe(1);
		expect(fixed.match(/\.\.\/app\.css/g)!.length).toBe(1);
	});

	test('fixThemeImportOrder is a no-op when order is correct', () => {
		const input = [
			"import '@dryui/ui/themes/default.css';",
			"import '@dryui/ui/themes/dark.css';",
			"import '../app.css';"
		].join('\n');
		expect(fixThemeImportOrder(input)).toBe(input);
	});
});
