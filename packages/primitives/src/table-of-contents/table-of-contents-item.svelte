<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTableOfContentsCtx, type TocHeading } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
		heading: TocHeading;
		children?: Snippet<[{ heading: TocHeading; active: boolean }]>;
	}
	let { heading, children, class: className, ...rest }: Props = $props();
	const ctx = getTableOfContentsCtx();
	let active = $derived(ctx.activeId === heading.id);
</script>

<li data-level={heading.level} data-active={active || undefined} class={className} {...rest}>
	{#if children}
		{@render children({ heading, active })}
	{:else}
		<a href="#{heading.id}" aria-current={active ? 'location' : undefined}>
			{heading.text}
		</a>
	{/if}
</li>
