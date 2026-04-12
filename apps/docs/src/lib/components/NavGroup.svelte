<script lang="ts">
	import { Button } from '@dryui/ui';
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
</script>

<div class="group">
	<Button type="button" variant="ghost" aria-expanded={open} onclick={() => (open = !open)}>
		<span class="trigger-content">
			<span class="icon-slot">
				{#if icon}
					<span class="icon">{@render icon()}</span>
				{/if}
				<span class="chevron" class:open></span>
			</span>
			<span class="label">{label}</span>
			{#if count != null}
				<span class="count">{count}</span>
			{/if}
		</span>
	</Button>
	<div class="content" class:open>
		<div class="inner" data-depth={depth}>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.group {
		display: grid;
		--dry-btn-accent-fg: var(--dry-color-text-strong);
		--dry-btn-accent-weak: var(--dry-color-fill-hover);
		--dry-btn-ghost-underline: transparent;
		--dry-btn-padding-x: var(--dry-sidebar-item-padding-x, var(--dry-space-3));
		--dry-btn-padding-y: var(--dry-sidebar-item-padding-y, var(--dry-space-2));
		--dry-btn-radius: 0;
		--dry-btn-font-size: var(--dry-text-sm-size, 0.875rem);
	}

	.trigger-content {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
		justify-self: stretch;
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

	.label {
		justify-self: start;
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
	.group:hover .icon {
		opacity: 0;
	}

	.group:hover .chevron {
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

	.inner[data-depth='0'] {
		--dry-sidebar-item-padding-x: calc(var(--dry-space-3) + 16px + var(--dry-space-2));
	}

	.inner[data-depth='1'] {
		--dry-sidebar-item-padding-x: calc(var(--dry-space-3) + 32px + 2 * var(--dry-space-2));
	}

	.inner[data-depth='2'] {
		--dry-sidebar-item-padding-x: calc(var(--dry-space-3) + 48px + 3 * var(--dry-space-2));
	}

	@media (prefers-reduced-motion: reduce) {
		.content,
		.chevron,
		.icon {
			transition: none;
		}
	}
</style>
