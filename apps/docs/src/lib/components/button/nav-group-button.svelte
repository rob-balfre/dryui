<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		count?: number | undefined;
		open: boolean;
		icon?: Snippet | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
	}

	let { label, count, open, icon, onclick }: Props = $props();
</script>

<button class="trigger" type="button" aria-expanded={open} {onclick}>
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
</button>

<style>
	.trigger {
		display: grid;
		align-items: center;
		min-height: var(--dry-sidebar-item-height, var(--dry-space-12));
		padding: var(--dry-sidebar-item-padding-y, var(--dry-space-3)) var(--dry-sidebar-item-padding-x);
		color: var(--dry-color-text-strong);
		background: transparent;
		border: 0;
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 500;
		line-height: 1.25;
		text-decoration: none;
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	.trigger:hover {
		background: var(--dry-color-fill);
	}

	.trigger:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
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
	.trigger:hover .icon,
	.trigger:focus-visible .icon {
		opacity: 0;
	}

	.trigger:hover .chevron,
	.trigger:focus-visible .chevron {
		opacity: 1;
	}

	.count {
		justify-self: end;
		font-weight: 400;
		font-size: var(--dry-text-xs-size);
		opacity: 0.5;
	}

	@media (prefers-reduced-motion: reduce) {
		.chevron,
		.icon {
			transition: none;
		}
	}
</style>
