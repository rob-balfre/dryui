<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-table-wrapper>
	<table class={className} {...rest}>
		{@render children()}
	</table>
</div>

<style>
	[data-table-wrapper] {
		--dry-scrollbar-thumb: var(--dry-color-stroke-weak);
		--dry-scrollbar-track: transparent;

		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		overflow-x: auto;
		scrollbar-color: var(--dry-scrollbar-thumb) var(--dry-scrollbar-track);

		&::-webkit-scrollbar {
			height: 8px;
		}
		&::-webkit-scrollbar-track {
			background: var(--dry-scrollbar-track);
		}
		&::-webkit-scrollbar-thumb {
			background: var(--dry-scrollbar-thumb);
			border-radius: var(--dry-radius-full);
			border: 2px solid transparent;
			background-clip: content-box;
		}
		&::-webkit-scrollbar-thumb:hover {
			background: var(--dry-color-stroke-strong);
			background-clip: content-box;
		}
	}

	table {
		--dry-table-border: var(--dry-surface-border, var(--dry-color-stroke-weak));
		--dry-table-header-bg: var(--dry-surface-bg, var(--dry-color-fill));
		--dry-table-padding-x: var(--dry-space-3);
		--dry-table-padding-y: var(--dry-space-3);

		border-collapse: collapse;
		border-spacing: 0;
	}

	@container (max-width: 640px) {
		table {
			--dry-table-padding-x: var(--dry-space-2);
			--dry-table-padding-y: var(--dry-space-2);
			--dry-table-head-padding-y: var(--dry-space-1_5);
		}
	}
</style>
