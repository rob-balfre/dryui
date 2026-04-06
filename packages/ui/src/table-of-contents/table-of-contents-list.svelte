<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTableOfContentsCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLOListElement> {}

	let { class: className, ...rest }: Props = $props();
	const ctx = getTableOfContentsCtx();
</script>

<ol data-part="list" class={className} {...rest}>
	{#each ctx.headings as heading}
		<li
			data-part="item"
			data-level={heading.level}
			data-active={ctx.activeId === heading.id || undefined}
		>
			<a href="#{heading.id}" aria-current={ctx.activeId === heading.id ? 'location' : undefined}>
				{heading.text}
			</a>
		</li>
	{/each}
</ol>

<style>
	[data-part='list'] {
		display: grid;
		gap: var(--dry-space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	[data-part='item'] {
		color: var(--dry-toc-muted-color, var(--dry-color-text-weak));
	}

	[data-part='item'] > a {
		display: block;
		padding: var(--dry-toc-item-padding-y, var(--dry-space-1_5))
			var(--dry-toc-item-padding-x, var(--dry-space-2));
		border-radius: var(--dry-radius-md);
		color: inherit;
		text-decoration: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='item']:hover > a {
		background: var(--dry-color-fill);
	}

	[data-part='item'][data-active] {
		color: var(--dry-toc-active-color, var(--dry-color-text-brand));
	}

	[data-part='item'][data-active] > a {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-toc-active-color, var(--dry-color-text-brand));
		box-shadow: inset 2px 0 0 var(--dry-color-stroke-selected);
		font-weight: 600;
	}

	[data-part='item'][data-level='3'] > a {
		padding-inline-start: calc(
			var(--dry-toc-item-padding-x, var(--dry-space-2)) + var(--dry-toc-indent, var(--dry-space-4))
		);
	}

	[data-part='item'][data-level='4'] > a {
		padding-inline-start: calc(
			var(--dry-toc-item-padding-x, var(--dry-space-2)) +
				(var(--dry-toc-indent, var(--dry-space-4)) * 2)
		);
	}

	[data-part='item']:focus-within > a {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
