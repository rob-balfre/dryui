import { describe, it, expect } from 'bun:test';
import { svelteHighlighter } from '../../../packages/ui/src/code-block/highlighter/svelte.js';
import type { Token } from '../../../packages/ui/src/code-block/highlighter/types.js';

function tokensOf(code: string, type: string): Token[] {
	return svelteHighlighter(code).filter((t) => t.type === type);
}

function textOf(code: string, token: Token): string {
	return code.slice(token.start, token.end);
}

function assertNoOverlap(code: string): void {
	const tokens = svelteHighlighter(code);
	const sorted = [...tokens].sort((a, b) => a.start - b.start);
	for (let i = 1; i < sorted.length; i++) {
		if (sorted[i].start < sorted[i - 1].end) {
			throw new Error(
				`Overlap: ${sorted[i - 1].type}[${sorted[i - 1].start}:${sorted[i - 1].end}] and ${sorted[i].type}[${sorted[i].start}:${sorted[i].end}] in "${code}"`
			);
		}
	}
}

describe('svelteHighlighter', () => {
	describe('HTML tags', () => {
		it('recognizes opening tag name', () => {
			const code = '<div>';
			const tags = tokensOf(code, 'tag');
			expect(tags.length).toBe(1);
			expect(textOf(code, tags[0])).toBe('div');
		});

		it('recognizes closing tag name', () => {
			const code = '</div>';
			const tags = tokensOf(code, 'tag');
			expect(tags.length).toBe(1);
			expect(textOf(code, tags[0])).toBe('div');
		});

		it('recognizes self-closing tag', () => {
			const code = '<br />';
			const tags = tokensOf(code, 'tag');
			expect(tags.length).toBe(1);
			expect(textOf(code, tags[0])).toBe('br');
		});

		it('emits angle brackets as punctuation', () => {
			const code = '<div>';
			const puncs = tokensOf(code, 'punctuation');
			const texts = puncs.map((p) => textOf(code, p));
			expect(texts).toContain('<');
			expect(texts).toContain('>');
		});

		it('does not treat < as tag in comparison', () => {
			const code = 'const isSmall = x < 5';
			const tags = tokensOf(code, 'tag');
			expect(tags.length).toBe(0);
			const ops = tokensOf(code, 'operator');
			const opTexts = ops.map((o) => textOf(code, o));
			expect(opTexts).toContain('<');
		});

		it('has no overlapping tokens', () => {
			assertNoOverlap('<div class="test">hello</div>');
		});
	});

	describe('Component names', () => {
		it('recognizes PascalCase as component', () => {
			const code = '<Button>';
			const comps = tokensOf(code, 'component');
			expect(comps.length).toBe(1);
			expect(textOf(code, comps[0])).toBe('Button');
		});

		it('recognizes dotted names', () => {
			const code = '<DataGrid.Column>';
			const comps = tokensOf(code, 'component');
			expect(comps.length).toBe(1);
			expect(textOf(code, comps[0])).toBe('DataGrid.Column');
		});

		it('recognizes closing component tag', () => {
			const code = '</Button>';
			const comps = tokensOf(code, 'component');
			expect(comps.length).toBe(1);
			expect(textOf(code, comps[0])).toBe('Button');
		});

		it('highlights svelte:head and colon-namespaced elements', () => {
			const code = '<svelte:head>';
			const tags = tokensOf(code, 'tag');
			expect(tags.some((t) => textOf(code, t) === 'svelte:head')).toBe(true);
		});

		it('has no overlapping tokens', () => {
			assertNoOverlap('<DataGrid.Column />');
		});
	});

	describe('Attributes', () => {
		it('recognizes attribute names', () => {
			const code = '<div class="test">';
			const attrs = tokensOf(code, 'attribute');
			expect(attrs.length).toBe(1);
			expect(textOf(code, attrs[0])).toBe('class');
		});

		it('recognizes boolean attributes', () => {
			const code = '<input disabled>';
			const attrs = tokensOf(code, 'attribute');
			expect(attrs.length).toBe(1);
			expect(textOf(code, attrs[0])).toBe('disabled');
		});

		it('recognizes attribute string values', () => {
			const code = '<div class="test">';
			const strs = tokensOf(code, 'string');
			expect(strs.length).toBe(1);
			expect(textOf(code, strs[0])).toBe('"test"');
		});

		it('emits = as operator', () => {
			const code = '<div class="test">';
			const ops = tokensOf(code, 'operator');
			const opTexts = ops.map((o) => textOf(code, o));
			expect(opTexts).toContain('=');
		});

		it('handles multiple attributes', () => {
			const code = '<input type="text" name="foo">';
			const attrs = tokensOf(code, 'attribute');
			expect(attrs.length).toBe(2);
			expect(textOf(code, attrs[0])).toBe('type');
			expect(textOf(code, attrs[1])).toBe('name');
		});

		it('highlights hyphenated attributes', () => {
			const code = '<div data-testid="foo" aria-label="bar">';
			const attrs = tokensOf(code, 'attribute');
			expect(attrs.some((t) => textOf(code, t) === 'data-testid')).toBe(true);
			expect(attrs.some((t) => textOf(code, t) === 'aria-label')).toBe(true);
		});

		it('has no overlapping tokens', () => {
			assertNoOverlap('<Button variant="solid" onclick={() => count++}>');
		});
	});

	describe('Strings and comments', () => {
		it('recognizes double-quoted strings in script', () => {
			const code = 'const x = "hello"';
			const strs = tokensOf(code, 'string');
			expect(strs.length).toBe(1);
			expect(textOf(code, strs[0])).toBe('"hello"');
		});

		it('recognizes template literals', () => {
			const code = 'const x = `hello`';
			const strs = tokensOf(code, 'string');
			expect(strs.length).toBe(1);
			expect(textOf(code, strs[0])).toBe('`hello`');
		});

		it('recognizes line comments', () => {
			const code = '// this is a comment';
			const comments = tokensOf(code, 'comment');
			expect(comments.length).toBe(1);
			expect(textOf(code, comments[0])).toBe('// this is a comment');
		});

		it('recognizes HTML comments', () => {
			const code = '<!-- this is a comment -->';
			const comments = tokensOf(code, 'comment');
			expect(comments.length).toBe(1);
			expect(textOf(code, comments[0])).toBe('<!-- this is a comment -->');
		});

		it('recognizes block comments', () => {
			const code = '/* block comment */';
			const comments = tokensOf(code, 'comment');
			expect(comments.length).toBe(1);
			expect(textOf(code, comments[0])).toBe('/* block comment */');
		});

		it('handles escaped quotes in strings', () => {
			const code = 'const x = "he said \\"hi\\""';
			const strs = tokensOf(code, 'string');
			expect(strs.length).toBe(1);
			expect(textOf(code, strs[0])).toBe('"he said \\"hi\\""');
		});
	});

	describe('Keywords and numbers', () => {
		it('recognizes JS keywords', () => {
			const code = 'const x = 1';
			const kws = tokensOf(code, 'keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe('const');
		});

		it('recognizes numbers', () => {
			const code = 'const x = 42';
			const nums = tokensOf(code, 'number');
			expect(nums.length).toBe(1);
			expect(textOf(code, nums[0])).toBe('42');
		});

		it('recognizes operators', () => {
			const code = 'const x = 1';
			const ops = tokensOf(code, 'operator');
			const opTexts = ops.map((o) => textOf(code, o));
			expect(opTexts).toContain('=');
		});

		it('recognizes arrow functions', () => {
			const code = '() => {}';
			const ops = tokensOf(code, 'operator');
			const opTexts = ops.map((o) => textOf(code, o));
			expect(opTexts).toContain('=>');
		});

		it('treats < as operator in comparison', () => {
			const code = 'x < 5';
			const ops = tokensOf(code, 'operator');
			const opTexts = ops.map((o) => textOf(code, o));
			expect(opTexts).toContain('<');
		});

		it('treats > as operator', () => {
			const code = 'x > 5';
			const ops = tokensOf(code, 'operator');
			const opTexts = ops.map((o) => textOf(code, o));
			expect(opTexts).toContain('>');
		});

		it('highlights hex numbers', () => {
			const code = 'const color = 0xFF00FF';
			const nums = tokensOf(code, 'number');
			expect(nums.some((t) => textOf(code, t) === '0xFF00FF')).toBe(true);
		});
	});

	describe('Svelte template blocks', () => {
		it('recognizes {#each}', () => {
			const code = '{#each items as item}';
			const kws = tokensOf(code, 'svelte-keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe('#each');
		});

		it('recognizes {/each}', () => {
			const code = '{/each}';
			const kws = tokensOf(code, 'svelte-keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe('/each');
		});

		it('recognizes {:else}', () => {
			const code = '{:else}';
			const kws = tokensOf(code, 'svelte-keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe(':else');
		});

		it('recognizes {#snippet}', () => {
			const code = '{#snippet header()}';
			const kws = tokensOf(code, 'svelte-keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe('#snippet');
		});

		it('recognizes {@render}', () => {
			const code = '{@render header()}';
			const kws = tokensOf(code, 'svelte-keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe('@render');
		});

		it('recognizes {@html}', () => {
			const code = '{@html content}';
			const kws = tokensOf(code, 'svelte-keyword');
			expect(kws.length).toBe(1);
			expect(textOf(code, kws[0])).toBe('@html');
		});

		it('emits block braces as punctuation', () => {
			const code = '{#each items as item}';
			const puncs = tokensOf(code, 'punctuation');
			const texts = puncs.map((p) => textOf(code, p));
			expect(texts).toContain('{');
			expect(texts).toContain('}');
		});

		it('recognizes as inside {#each} as keyword', () => {
			const code = '{#each items as item}';
			const kws = tokensOf(code, 'keyword');
			const kwTexts = kws.map((k) => textOf(code, k));
			expect(kwTexts).toContain('as');
		});

		it('has no overlapping tokens for template blocks', () => {
			assertNoOverlap('{#each items as item}{/each}');
			assertNoOverlap('{#if condition}{:else}{/if}');
			assertNoOverlap('{@render header()}');
		});
	});

	describe('Runes', () => {
		it('recognizes $state', () => {
			const code = 'let count = $state(0)';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$state');
		});

		it('recognizes $derived', () => {
			const code = 'let doubled = $derived(count * 2)';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$derived');
		});

		it('recognizes $derived.by', () => {
			const code = 'let total = $derived.by(() => a + b)';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$derived.by');
		});

		it('recognizes $state.raw', () => {
			const code = 'let items = $state.raw([])';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$state.raw');
		});

		it('recognizes $effect', () => {
			const code = '$effect(() => {})';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$effect');
		});

		it('recognizes $effect.pre', () => {
			const code = '$effect.pre(() => {})';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$effect.pre');
		});

		it('recognizes $props', () => {
			const code = 'let { name } = $props()';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$props');
		});

		it('recognizes $bindable', () => {
			const code = 'let { value = $bindable() } = $props()';
			const runes = tokensOf(code, 'rune');
			const runeTexts = runes.map((r) => textOf(code, r));
			expect(runeTexts).toContain('$bindable');
			expect(runeTexts).toContain('$props');
		});

		it('recognizes $inspect', () => {
			const code = '$inspect(count)';
			const runes = tokensOf(code, 'rune');
			expect(runes.length).toBe(1);
			expect(textOf(code, runes[0])).toBe('$inspect');
		});
	});

	describe('Functions', () => {
		it('recognizes function calls', () => {
			const code = 'handleClick()';
			const fns = tokensOf(code, 'function');
			expect(fns.length).toBe(1);
			expect(textOf(code, fns[0])).toBe('handleClick');
		});

		it('recognizes method calls', () => {
			const code = 'num.toLocaleString()';
			const fns = tokensOf(code, 'function');
			const fnTexts = fns.map((f) => textOf(code, f));
			expect(fnTexts).toContain('toLocaleString');
		});

		it('does not treat keywords as functions', () => {
			const code = 'if (true)';
			const fns = tokensOf(code, 'function');
			expect(fns.length).toBe(0);
		});
	});

	describe('Types', () => {
		it('recognizes type keywords', () => {
			const code = 'interface Props extends Base {}';
			const kws = tokensOf(code, 'keyword');
			const kwTexts = kws.map((k) => textOf(code, k));
			expect(kwTexts).toContain('interface');
			expect(kwTexts).toContain('extends');
		});

		it('recognizes type names after type keywords', () => {
			const code = 'interface Props {}';
			const types = tokensOf(code, 'type');
			expect(types.length).toBe(1);
			expect(textOf(code, types[0])).toBe('Props');
		});

		it('recognizes type after extends', () => {
			const code = 'interface Props extends Base {}';
			const types = tokensOf(code, 'type');
			const typeTexts = types.map((t) => textOf(code, t));
			expect(typeTexts).toContain('Props');
			expect(typeTexts).toContain('Base');
		});
	});
});
