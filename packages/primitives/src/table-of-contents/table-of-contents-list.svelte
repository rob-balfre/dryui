<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTableOfContentsCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLOListElement> {}
	let { class: className, ...rest }: Props = $props();
	const ctx = getTableOfContentsCtx();
</script>

<ol class={className} {...rest}>
	{#each ctx.headings as heading}
		<li data-level={heading.level} data-active={ctx.activeId === heading.id || undefined}>
			<a href="#{heading.id}" aria-current={ctx.activeId === heading.id ? 'location' : undefined}>
				{heading.text}
			</a>
		</li>
	{/each}
</ol>
