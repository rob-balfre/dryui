<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		children?:
			| Snippet<
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
			  >
			| undefined;
	}

	let { children, ...rest }: Props = $props();

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

<nav aria-label="Pagination" {...rest}>
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
