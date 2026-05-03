<!--
	Pagination intentionally has no `--dry-pagination-*` token surface.
	The numeric and nav buttons are rendered by the shared Button component, so
	pagination delegates its visual chrome (bg, border, radius, padding) to the
	inherited button tokens (`--dry-btn-*`). Override those at the pagination
	root (or higher) to retheme pagination.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setPaginationCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		page?: number;
		totalPages: number;
		children: Snippet;
	}

	let { page = $bindable(1), class: className, children, totalPages, ...rest }: Props = $props();

	setPaginationCtx({
		get page() {
			return page;
		},
		get totalPages() {
			return totalPages;
		},
		get canPrevious() {
			return page > 1;
		},
		get canNext() {
			return page < totalPages;
		},
		goto(p: number) {
			page = Math.max(1, Math.min(totalPages, p));
		},
		previous() {
			if (page > 1) page--;
		},
		next() {
			if (page < totalPages) page++;
		}
	});
</script>

<nav aria-label="Pagination" class={className} {...rest}>
	{@render children()}
</nav>
