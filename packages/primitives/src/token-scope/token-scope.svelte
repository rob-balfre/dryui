<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tokens: Record<string, string>;
		children: Snippet;
	}

	let { tokens, children }: Props = $props();
	const id = $props.id();

	// Strip `}` and `;` from values so a stray character can't escape the rule
	// and inject sibling declarations.
	const rule = $derived(
		`[data-dry-token-scope="${id}"]{${Object.entries(tokens)
			.map(([name, value]) => `${name}:${value.replace(/[};]/g, '')}`)
			.join(';')}}`
	);

	let node: HTMLStyleElement | null = null;

	$effect(() => {
		const el = document.createElement('style');
		el.setAttribute('data-dry-token-scope', id);
		document.head.appendChild(el);
		node = el;
		return () => {
			el.remove();
			node = null;
		};
	});

	$effect(() => {
		if (node && node.textContent !== rule) {
			node.textContent = rule;
		}
	});
</script>

<div data-dry-token-scope={id} class="dry-token-scope">
	{@render children()}
</div>

<style>
	.dry-token-scope {
		display: contents;
	}
</style>
