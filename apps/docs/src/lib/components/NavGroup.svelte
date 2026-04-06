<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext, setContext } from 'svelte';

	interface Props {
		label: string;
		count?: number;
		open?: boolean;
		icon?: Snippet;
		children: Snippet;
	}

	let { label, count, open = $bindable(false), icon, children }: Props = $props();

	const depth = getContext<number>('navgroup-depth') ?? 0;
	setContext('navgroup-depth', depth + 1);

	const indent = `calc(var(--dry-space-3) + ${16 * (depth + 1)}px + ${depth + 1} * var(--dry-space-2))`;

	function applyIndent(node: HTMLElement) {
		node.style.setProperty('--dry-sidebar-item-padding-x', indent);
	}
</script>

<div class="group">
	<button type="button" class="trigger" aria-expanded={open} onclick={() => (open = !open)}>
		<span class="icon-slot">
			{#if icon}
				<span class="icon">{@render icon()}</span>
			{/if}
			<span class="chevron" class:open></span>
		</span>
		{label}
		{#if count != null}
			<span class="count">{count}</span>
		{/if}
	</button>
	<div class="content" class:open>
		<div class="inner" {@attach applyIndent}>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.group {
		display: grid;
	}

	.trigger {
		all: unset;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
		min-height: var(--dry-sidebar-item-height, var(--dry-space-12));
		padding-block: var(--dry-sidebar-item-padding-y, var(--dry-space-2));
		padding-inline-start: var(--dry-sidebar-item-padding-x, var(--dry-space-3));
		padding-inline-end: var(--dry-space-3);
		border-radius: 0;
		box-sizing: border-box;
		font-size: var(--dry-text-sm-size, 0.875rem);
		font-weight: 500;
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	.trigger:hover {
		background: var(--dry-color-fill-hover);
	}

	.trigger:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	.icon-slot {
		position: relative;
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		justify-items: center;
		aspect-ratio: 1;
		height: 16px;
	}

	.icon {
		display: inline-grid;
		grid-auto-flow: column;
		transition: opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	.chevron {
		position: absolute;
		inset: 0;
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		justify-items: center;
		opacity: 0;
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	.chevron::before {
		content: '';
		aspect-ratio: 1;
		height: 12px;
		background: currentColor;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")
			center / contain no-repeat;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	/* No icon provided — chevron always visible */
	.icon-slot:not(:has(.icon)) .chevron {
		opacity: 1;
	}

	/* Has icon — swap on hover */
	.trigger:hover .icon {
		opacity: 0;
	}

	.trigger:hover .chevron {
		opacity: 1;
	}

	.count {
		justify-self: end;
		font-weight: 400;
		font-size: var(--dry-text-xs-size);
		opacity: 0.5;
	}

	.content {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--dry-duration-fast) var(--dry-ease-default);
	}

	.content.open {
		grid-template-rows: 1fr;
	}

	.inner {
		overflow: hidden;
		display: grid;
		gap: var(--dry-sidebar-group-gap, var(--dry-space-1));
	}

	@media (prefers-reduced-motion: reduce) {
		.content,
		.chevron,
		.icon {
			transition: none;
		}
	}
</style>
