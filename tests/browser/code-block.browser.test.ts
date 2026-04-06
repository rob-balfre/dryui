import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import CodeBlock from '../../packages/ui/src/code-block/code-block.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

function renderCodeBlock(props: { code: string; language?: string }) {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(CodeBlock, {
		target,
		props
	});

	mountedComponents.push(component);
	flushSync();
	return target;
}

describe('CodeBlock', () => {
	it('renders single-line code without injected layout whitespace', () => {
		const code = '<Button>Click me</Button>';
		const target = renderCodeBlock({ code, language: 'svelte' });
		const renderedCode = target.querySelector('[data-code-block] code');
		const root = target.querySelector('[data-code-block]');

		expect(root?.getAttribute('data-single-line')).toBe('true');
		expect(renderedCode?.textContent).toBe(code);
	});

	it('renders multiline code without extra blank lines between tokens', () => {
		const code = `<script lang="ts">
  let value = $state(['bold']);
</script>`;
		const target = renderCodeBlock({ code, language: 'svelte' });
		const renderedCode = target.querySelector('[data-code-block] code');

		expect(renderedCode?.textContent).toBe(code);
	});
});
