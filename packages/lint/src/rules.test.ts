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
		const violations = checkMarkup('<div data-layout="x" style="color: red">hello</div>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-inline-style');
	});

	test('flags style: directive', () => {
		const violations = checkMarkup('<div data-layout="x" style:color="red">hello</div>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-style-directive');
	});

	test('flags @attach tags', () => {
		const violations = checkMarkup('<Text {@attach applyClassName}>hello</Text>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-attach');
	});

	test('flags multiline @attach tags', () => {
		const code = `<Text
  {@attach applyClassName}
>hello</Text>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-attach');
	});

	test('does not flag @attach inside comments', () => {
		const violations = checkMarkup('<!-- <Text {@attach applyClassName}>hello</Text> -->');
		expect(violations).toHaveLength(0);
	});

	test('flags <Grid component', () => {
		const violations = checkMarkup('<Grid columns={3}>child</Grid>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags <Stack component', () => {
		const violations = checkMarkup('<Stack gap="md">child</Stack>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags <Flex component', () => {
		const violations = checkMarkup('<Flex>child</Flex>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('flags compound component usage <Stack.Root', () => {
		const violations = checkMarkup('<Stack.Root>child</Stack.Root>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-layout-component');
	});

	test('ignores non-layout components', () => {
		const violations = checkMarkup('<Button>click</Button>');
		expect(violations).toHaveLength(0);
	});

	test('flags raw div and span elements outside layout hooks', () => {
		const violations = checkMarkup(
			'<div class="grid"><span>text</span></div>',
			'src/routes/+page.svelte'
		);
		expect(violations).toHaveLength(2);
		expect(violations.map((violation) => violation.rule)).toEqual([
			'dryui/no-raw-element',
			'dryui/no-raw-element'
		]);
		expect(violations[0]!.message).toContain('<div>');
		expect(violations[1]!.message).toContain('<span>');
	});

	test('allows raw layout hook elements', () => {
		const code = `<main data-layout="starter">
  <section data-layout-area="intro">
    <Tabs.Root>
      <Tabs.Content value="one">Ready</Tabs.Content>
    </Tabs.Root>
  </section>
</main>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		expect(violations).toHaveLength(0);
	});

	test('flags generic data-layout names that defeat the contract', () => {
		const code = `<div data-layout="ui">
  <span data-layout="wrapper">a</span>
  <p data-layout="box">b</p>
  <section data-layout="container">c</section>
  <div data-layout="div">d</div>
</div>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		const generic = violations.filter((v) => v.rule === 'dryui/no-generic-layout-name');
		expect(generic).toHaveLength(5);
		expect(generic[0]!.message).toContain('data-layout="ui"');
		expect(generic[1]!.message).toContain('data-layout="wrapper"');
	});

	test('flags additional generic synonyms', () => {
		const code = `<div data-layout="block">
  <div data-layout="el"></div>
  <div data-layout="elem"></div>
  <div data-layout="element"></div>
  <div data-layout="layout"></div>
  <div data-layout="inner"></div>
  <div data-layout="outer"></div>
</div>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		const generic = violations.filter((v) => v.rule === 'dryui/no-generic-layout-name');
		expect(generic).toHaveLength(7);
	});

	test('matches generic names case-insensitively and trims whitespace', () => {
		const code = `<div data-layout="UI">
  <div data-layout="  Wrapper  "></div>
</div>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		const generic = violations.filter((v) => v.rule === 'dryui/no-generic-layout-name');
		expect(generic).toHaveLength(2);
	});

	test('allows meaningful data-layout names', () => {
		const code = `<main data-layout="app-shell">
  <section data-layout="kpi-strip"></section>
  <section data-layout="traveler-row"></section>
  <article data-layout="article"></article>
  <div data-layout="my-ui"></div>
  <div data-layout="container-pane"></div>
</main>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		const generic = violations.filter((v) => v.rule === 'dryui/no-generic-layout-name');
		expect(generic).toHaveLength(0);
	});

	test('does not flag generic names on data-layout-area', () => {
		const code = `<main data-layout="app-shell">
  <aside data-layout-area="ui"></aside>
  <section data-layout-area="wrapper"></section>
</main>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		const generic = violations.filter((v) => v.rule === 'dryui/no-generic-layout-name');
		expect(generic).toHaveLength(0);
	});

	test('skips data-layout with expression value (cannot evaluate statically)', () => {
		const code = `<div data-layout={kind}>
  <div data-layout={isHero ? "ui" : "hero"}></div>
</div>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		const generic = violations.filter((v) => v.rule === 'dryui/no-generic-layout-name');
		expect(generic).toHaveLength(0);
	});

	test('allows Svelte components and Svelte special elements', () => {
		const code = `<svelte:head>
  <title>Docs</title>
  <meta name="description" content="DryUI docs" />
</svelte:head>
<Tabs.Root>
  <Button>Save</Button>
  <slot />
</Tabs.Root>`;
		const violations = checkMarkup(code, 'src/routes/+page.svelte');
		expect(violations).toHaveLength(0);
	});

	test('flags class= on a compound component', () => {
		const violations = checkMarkup('<Tabs.Root class="custom">content</Tabs.Root>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
		expect(violations[0]!.message).toContain('Tabs.Root');
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

	test('flags class= on Button', () => {
		const violations = checkMarkup('<Button class="my-btn" color="ink">click</Button>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
	});

	test('flags class= on Heading/Text', () => {
		const violations = checkMarkup('<Heading class="hero">Title</Heading>');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
		const violationsText = checkMarkup('<Text class="lede">Body copy</Text>');
		expect(violationsText).toHaveLength(1);
		expect(violationsText[0]!.rule).toBe('dryui/no-component-class');
	});

	test('flags class= on multi-line Button tag', () => {
		const code = `<Button
  variant="solid"
  color="ink"
  class="extra"
>click</Button>`;
		const violations = checkMarkup(code);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-component-class');
	});

	test('does not flag class= on HTML elements', () => {
		const violations = checkMarkup(
			'<div data-layout="x" class="wrapper"><p data-layout-area="y" class="text">hi</p></div>'
		);
		expect(violations.some((v) => v.rule === 'dryui/no-component-class')).toBe(false);
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
<div data-layout="x">content</div>
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

	test('flags generated transcript and tool artifacts in markup', () => {
		const code = [
			'<Text>ready</Text>',
			'<Text>toolu_01A2B3C4D5E6</Text>',
			'<tool_use id="x"></tool_use>',
			'<tool_call name="shell"></tool_call>',
			'<task-notification>running</task-notification>',
			'<subagent_notification>done</subagent_notification>',
			'<function_call name="functions.exec_command"></function_call>',
			'<invoke name="TodoWrite"></invoke>',
			'<parameter name="todos">[]</parameter>',
			'<Text>TaskOutput</Text>',
			'<Text>TodoWrite</Text>',
			'<Text>mcp__github__get_issue</Text>',
			'analysis to=functions.exec_command code'
		].join('\n');
		const artifacts = checkSvelteFile(code, 'src/routes/+page.svelte').filter(
			(v) => v.rule === 'dryui/no-transcript-artifact'
		);

		expect(artifacts).toHaveLength(12);
		expect(artifacts.map((v) => v.line)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
		expect(artifacts[0]!.message).toContain('toolu_*');
		expect(artifacts[1]!.message).toContain('<tool_use>');
		expect(artifacts[2]!.message).toContain('<tool_call>');
		expect(artifacts[7]!.message).toContain('<parameter>');
		expect(artifacts[10]!.message).toContain('mcp__*');
		expect(artifacts[11]!.message).toContain('analysis to=...');
	});

	test('flags channel markers embedded in route text nodes', () => {
		const code = `<main data-layout="agent-shell">
  <section data-layout-area="primary">
    <Text>analysis to=functions.exec_command code</Text>
    <Text>assistant to=web.run code</Text>
  </section>
</main>`;
		const artifacts = checkSvelteFile(code, 'src/routes/+page.svelte').filter(
			(v) => v.rule === 'dryui/no-transcript-artifact'
		);

		expect(artifacts).toHaveLength(2);
		expect(artifacts[0]!.message).toContain('analysis to=...');
		expect(artifacts[1]!.message).toContain('assistant to=...');
	});

	test('does not flag normal task prose or non-template transcript text', () => {
		const code = `<script>
  const transcript = 'toolu_01A2B3C4D5E6';
</script>
<!-- <tool_use>ignore comments</tool_use> -->
<Text>Task completion output is ready.</Text>
<style>
  .example::after { content: "TodoWrite"; }
</style>`;
		const artifacts = checkSvelteFile(code, 'src/routes/+page.svelte').filter(
			(v) => v.rule === 'dryui/no-transcript-artifact'
		);

		expect(artifacts).toHaveLength(0);
	});

	test('allows assistant labels in chat UI copy', () => {
		const code = `<main data-layout="chat-shell">
  <section data-layout-area="primary">
    Assistant: I will help with your booking.
    <Text>Assistant: How can I help with your booking?</Text>
  </section>
</main>`;
		const artifacts = checkSvelteFile(code, 'src/routes/+page.svelte').filter(
			(v) => v.rule === 'dryui/no-transcript-artifact'
		);

		expect(artifacts).toHaveLength(0);
	});

	test('does not flag svelte-ignore css_unused_selector inside script block', () => {
		const code = `<script>
  // <!-- svelte-ignore css_unused_selector -->
  const x = '<!-- svelte-ignore css_unused_selector -->';
</script>
<div data-layout="x">clean</div>`;
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

	test('allows <svelte:element> with dryui-allow comment on preceding line', () => {
		const code = `<!-- dryui-allow svelte-element -->
<svelte:element this={tag}>heading</svelte:element>`;
		expect(checkMarkup(code)).toHaveLength(0);
	});

	test('allows <svelte:element> in owner directories', () => {
		const code = `<svelte:element this={tag}>heading</svelte:element>`;
		expect(checkMarkup(code, '/abs/packages/ui/src/motion/enter.svelte')).toHaveLength(0);
		expect(
			checkMarkup(code, '/abs/packages/primitives/src/page-header/page-header-title.svelte')
		).toHaveLength(0);
	});

	test('flags <svelte:element> outside owner directories', () => {
		const code = `<svelte:element this={tag}>heading</svelte:element>`;
		expect(checkMarkup(code, '/abs/some/other/file.svelte')).toHaveLength(1);
	});

	test('does not flag <svelte:element> inside script string', () => {
		const code = `<script>
  const s = '<svelte:element this={x}>';
</script>
<div data-layout="x">clean</div>`;
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

	test('allows flex with dryui-allow comment on preceding line', () => {
		const violations = checkStyle(`/* dryui-allow flex */
.foo { display: flex; flex-wrap: wrap; }`);
		expect(violations.filter((v) => v.rule === 'dryui/no-flex')).toHaveLength(0);
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

	test('allows width with dryui-allow comment on preceding line', () => {
		const violations = checkStyle(`/* dryui-allow width */
.foo { width: 300px; }`);
		expect(violations.filter((v) => v.rule === 'dryui/no-width')).toHaveLength(0);
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

	test('flags !important everywhere (no owner carve-out)', () => {
		const code = '.foo { color: red !important; }';
		expect(checkStyle(code)).toHaveLength(1);
		expect(checkStyle(code, {}, '/abs/packages/ui/src/motion/enter.svelte')).toHaveLength(1);
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

	test('allows display: grid inside src/layout.css', () => {
		const violations = checkStyle('.foo { display: grid; }', {}, 'src/layout.css');
		expect(violations).toHaveLength(0);
	});

	test('allows grid properties inside src/layout.css', () => {
		const violations = checkStyle(
			'.foo { grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center; }',
			{},
			'src/layout.css'
		);
		expect(violations).toHaveLength(0);
	});

	test('allows @container queries', () => {
		const violations = checkStyle('@container (max-width: 36rem) { .foo { --columns: 1fr; } }');
		expect(violations).toHaveLength(0);
	});

	test('flags raw grid outside src/layout.css', () => {
		const violations = checkStyle(
			'.foo { display: grid; grid-template-columns: minmax(0, 1fr) auto; }',
			{},
			'src/routes/+page.svelte'
		);
		expect(violations).toHaveLength(2);
		expect(violations[0]!.rule).toBe('dryui/no-raw-grid');
		expect(violations[0]!.message).toContain('display: grid');
		expect(violations[1]!.message).toContain('grid-template-columns');
	});

	test('raw grid is flagged on every offending declaration', () => {
		const violations = checkStyle(
			'.foo { display: grid; grid-template-columns: 1fr; }',
			{},
			'src/routes/+page.svelte'
		);
		expect(violations).toHaveLength(2);
		expect(violations.every((violation) => violation.rule === 'dryui/no-raw-grid')).toBe(true);
	});

	test('checkSvelteFile flags raw grid in component <style> blocks', () => {
		const code = `<div data-layout="docs-shell">content</div>

<style>
  .layout {
    display: grid;
  }
</style>`;
		const violations = checkSvelteFile(code, 'src/routes/+page.svelte');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-raw-grid');
		expect(violations[0]!.line).toBe(5);
	});

	test('checkSvelteFile flags raw HTML elements outside layout hooks', () => {
		const code = `<div class="layout">content</div>

<style>
  .layout {
    display: block;
  }
</style>`;
		const violations = checkSvelteFile(code, 'src/routes/+page.svelte');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/no-raw-element');
		expect(violations[0]!.line).toBe(1);
	});

	test('checkSvelteFile allows layout hooks', () => {
		const code = `<main data-layout="starter">
  <section data-layout-area="intro">
    <Tabs.Root>
      <Tabs.Content value="one">Ready</Tabs.Content>
    </Tabs.Root>
  </section>
</main>`;
		const violations = checkSvelteFile(code, 'src/routes/+page.svelte');
		expect(violations).toHaveLength(0);
	});

	test('allows display: flex inside owner directories', () => {
		expect(
			checkStyle(
				'.foo { display: flex; }',
				{},
				'/abs/packages/primitives/src/page-header/page-header-meta.svelte'
			)
		).toHaveLength(0);
	});

	test('allows flex-direction inside owner directories', () => {
		expect(
			checkStyle(
				'flex-direction: row;',
				{},
				'/abs/packages/primitives/src/page-header/page-header-meta.svelte'
			)
		).toHaveLength(0);
	});

	test('flags display: flex outside owner directories', () => {
		expect(
			checkStyle('.foo { display: flex; }', {}, '/abs/packages/ui/src/card/card-root.svelte')
		).toHaveLength(1);
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

	test('allows partial inset shadow with dryui-allow comment on preceding line', () => {
		const violations = checkStyle(`/* dryui-allow inset-shadow */
.foo { box-shadow: inset 2px 0 0 blue; }`);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
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

	test('allows partial inset inside owner directories', () => {
		const violations = checkStyle(
			'.foo { box-shadow: inset 2px 0 0 blue; }',
			{},
			'/abs/packages/ui/src/option-picker/option-picker-preview.svelte'
		);
		expect(violations.filter((v) => v.rule === 'dryui/no-partial-inset-shadow')).toHaveLength(0);
	});

	test('flags partial inset outside owner directories', () => {
		const violations = checkStyle(
			'.foo { box-shadow: inset 2px 0 0 blue; }',
			{},
			'/abs/packages/ui/src/card/card-root.svelte'
		);
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
			'<div data-layout="x" style="color: red">hello</div>',
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
