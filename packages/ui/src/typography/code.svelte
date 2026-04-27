<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: classAttr, children, ...rest }: Props = $props();
</script>

<code class={classAttr} {...rest}>{@render children()}</code>

<style>
	code {
		padding: 0.2em 0.45em;
		border: 1px solid var(--dry-typography-code-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-sm);
		background: var(--dry-typography-code-bg, var(--dry-color-bg-overlay));
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-mono);
		font-size: 0.94em;
		white-space: break-spaces;
	}
</style>
