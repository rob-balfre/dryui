<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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
		<span class="prev-slot">
			<Button
				variant="outline"
				size="sm"
				type="button"
				disabled={!canPrevious}
				onclick={previous}
				aria-label="Go to previous page"
			>
				Previous
			</Button>
		</span>
		<span data-pagination-info>
			Page {ctx.page} of {ctx.totalPages}
		</span>
		<span class="next-slot">
			<Button
				variant="outline"
				size="sm"
				type="button"
				disabled={!canNext}
				onclick={next}
				aria-label="Go to next page"
			>
				Next
			</Button>
		</span>
	{/if}
</nav>

<style>
	[data-dg-pagination] {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content minmax(0, 1fr);
		grid-template-areas: 'prev info next';
		align-items: center;
		column-gap: var(--dry-data-grid-pagination-gap);
		padding: var(--dry-space-3) var(--dry-data-grid-padding-x);
		border-top: 1px solid var(--dry-data-grid-border);
		font-size: var(--dry-type-small-size);
		color: var(--dry-color-text-weak);
	}

	.prev-slot {
		grid-area: prev;
		justify-self: start;
		display: inline-grid;
	}

	.next-slot {
		grid-area: next;
		justify-self: end;
		display: inline-grid;
	}

	[data-pagination-info] {
		grid-area: info;
		justify-self: center;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	@container (max-width: 400px) {
		[data-dg-pagination] {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-template-areas:
				'info info'
				'prev next';
			gap: var(--dry-space-2);
		}
	}
</style>
