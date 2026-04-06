<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		children?: Snippet<
			[
				{
					page: number;
					totalPages: number;
					totalItems: number;
					pageSize: number;
					canPrevious: boolean;
					canNext: boolean;
					previous: () => void;
					next: () => void;
					goto: (page: number) => void;
				}
			]
		>;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let canPrevious = $derived(ctx.page > 1);
	let canNext = $derived(ctx.page < ctx.totalPages);

	function previous() {
		if (canPrevious) ctx.setPage(ctx.page - 1);
	}

	function next() {
		if (canNext) ctx.setPage(ctx.page + 1);
	}

	function goto(page: number) {
		ctx.setPage(page);
	}
</script>

<nav aria-label="Pagination" data-dg-pagination class={className} {...rest}>
	{#if children}
		{@render children({
			page: ctx.page,
			totalPages: ctx.totalPages,
			totalItems: ctx.totalItems,
			pageSize: ctx.pageSize,
			canPrevious,
			canNext,
			previous,
			next,
			goto
		})}
	{:else}
		<button
			type="button"
			disabled={!canPrevious}
			onclick={previous}
			aria-label="Go to previous page"
			data-pagination-prev
		>
			Previous
		</button>
		<span data-pagination-info>
			Page {ctx.page} of {ctx.totalPages}
		</span>
		<button
			type="button"
			disabled={!canNext}
			onclick={next}
			aria-label="Go to next page"
			data-pagination-next
		>
			Next
		</button>
	{/if}
</nav>

<style>
	[data-dg-pagination] {
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		align-items: center;
		padding: var(--dry-space-3) var(--dry-data-grid-padding-x);
		border-top: 1px solid var(--dry-data-grid-border);
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		color: var(--dry-color-text-weak);
	}

	[data-dg-pagination] button[data-pagination-prev],
	[data-dg-pagination] button[data-pagination-next] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		padding: var(--dry-space-1_5) var(--dry-space-3);
		border: 1px solid var(--dry-data-grid-border);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-base);
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dg-pagination] button[data-pagination-prev]:hover:not(:disabled),
	[data-dg-pagination] button[data-pagination-next]:hover:not(:disabled) {
		background: var(--dry-data-grid-row-hover);
		border-color: var(--dry-color-text-weak);
	}

	[data-dg-pagination] button[data-pagination-prev]:focus-visible,
	[data-dg-pagination] button[data-pagination-next]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-dg-pagination] button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	[data-dg-pagination] [data-pagination-info] {
		font-variant-numeric: tabular-nums;
	}

	@container (max-width: 400px) {
		[data-dg-pagination] {
			grid-template-columns: 1fr;
			gap: var(--dry-space-2);
		}
	}
</style>
