<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type AreaGridSpace = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		gap?: AreaGridSpace;
		padding?: AreaGridSpace;
		debug?: boolean;
		children: Snippet;
	}

	let {
		gap = 'md',
		padding = 'none',
		debug = false,
		children,
		class: className,
		...rest
	}: Props = $props();
</script>

<section data-area-grid-shell data-gap={gap} data-padding={padding} class={className} {...rest}>
	<section data-area-grid data-debug={debug || undefined}>
		{@render children()}
	</section>
</section>

<style>
	[data-area-grid-shell] {
		--dry-area-grid-gap: var(--dry-space-4);
		--dry-area-grid-padding: 0;

		container-type: inline-size;
		display: grid;
		padding: var(--dry-area-grid-padding);
	}

	[data-area-grid] {
		--_dry-area-grid-columns: var(
			--dry-area-grid-template-columns,
			var(--dry-area-grid-columns, minmax(0, 1fr))
		);
		--_dry-area-grid-rows: var(--dry-area-grid-template-rows, var(--dry-area-grid-rows, none));
		--_dry-area-grid-template: var(
			--dry-area-grid-template-areas,
			var(--dry-area-grid-template, none)
		);
		--_dry-area-grid-auto-flow: var(--dry-area-grid-auto-flow, row);
		--_dry-area-grid-auto-rows: var(--dry-area-grid-auto-rows, auto);
		--_dry-area-grid-align-items: var(--dry-area-grid-align-items, stretch);
		--_dry-area-grid-justify-items: var(--dry-area-grid-justify-items, stretch);

		display: grid;
		grid-template-columns: var(--_dry-area-grid-columns);
		grid-template-rows: var(--_dry-area-grid-rows);
		grid-template-areas: var(--_dry-area-grid-template);
		grid-auto-flow: var(--_dry-area-grid-auto-flow);
		grid-auto-rows: var(--_dry-area-grid-auto-rows);
		align-items: var(--_dry-area-grid-align-items);
		justify-items: var(--_dry-area-grid-justify-items);
		gap: var(--dry-area-grid-gap);
	}

	[data-area-grid][data-debug] {
		--dry-area-grid-area-display: grid;
		--dry-area-grid-area-gap: var(--dry-space-2);
		--dry-area-grid-area-padding: var(--dry-space-4);
		--dry-area-grid-area-border: 1px solid var(--dry-color-stroke-weak);
		--dry-area-grid-area-radius: var(--dry-radius-lg);
		--dry-area-grid-area-bg: var(--dry-color-bg-raised);
		--dry-area-grid-area-color: var(--dry-color-text-strong);
	}

	[data-area-grid-shell][data-gap='none'] {
		--dry-area-grid-gap: 0;
	}

	[data-area-grid-shell][data-gap='xs'] {
		--dry-area-grid-gap: var(--dry-space-1);
	}

	[data-area-grid-shell][data-gap='sm'] {
		--dry-area-grid-gap: var(--dry-space-2);
	}

	[data-area-grid-shell][data-gap='md'] {
		--dry-area-grid-gap: var(--dry-space-4);
	}

	[data-area-grid-shell][data-gap='lg'] {
		--dry-area-grid-gap: var(--dry-space-6);
	}

	[data-area-grid-shell][data-gap='xl'] {
		--dry-area-grid-gap: var(--dry-space-8);
	}

	[data-area-grid-shell][data-padding='xs'] {
		--dry-area-grid-padding: var(--dry-space-1);
	}

	[data-area-grid-shell][data-padding='sm'] {
		--dry-area-grid-padding: var(--dry-space-2);
	}

	[data-area-grid-shell][data-padding='md'] {
		--dry-area-grid-padding: var(--dry-space-4);
	}

	[data-area-grid-shell][data-padding='lg'] {
		--dry-area-grid-padding: var(--dry-space-6);
	}

	[data-area-grid-shell][data-padding='xl'] {
		--dry-area-grid-padding: var(--dry-space-8);
	}

	@container (min-width: 720px) {
		[data-area-grid] {
			--_dry-area-grid-columns-wide: var(
				--dry-area-grid-template-columns-wide,
				var(--dry-area-grid-columns-wide, var(--_dry-area-grid-columns))
			);
			--_dry-area-grid-rows-wide: var(
				--dry-area-grid-template-rows-wide,
				var(--dry-area-grid-rows-wide, var(--_dry-area-grid-rows))
			);
			--_dry-area-grid-template-wide: var(
				--dry-area-grid-template-areas-wide,
				var(--dry-area-grid-template-wide, var(--_dry-area-grid-template))
			);

			grid-template-columns: var(--_dry-area-grid-columns-wide);
			grid-template-rows: var(--_dry-area-grid-rows-wide);
			grid-template-areas: var(--_dry-area-grid-template-wide);
		}
	}

	@container (min-width: 1024px) {
		[data-area-grid] {
			--_dry-area-grid-columns-xl: var(
				--dry-area-grid-template-columns-xl,
				var(--dry-area-grid-columns-xl, var(--_dry-area-grid-columns-wide))
			);
			--_dry-area-grid-rows-xl: var(
				--dry-area-grid-template-rows-xl,
				var(--dry-area-grid-rows-xl, var(--_dry-area-grid-rows-wide))
			);
			--_dry-area-grid-template-xl: var(
				--dry-area-grid-template-areas-xl,
				var(--dry-area-grid-template-xl, var(--_dry-area-grid-template-wide))
			);

			grid-template-columns: var(--_dry-area-grid-columns-xl);
			grid-template-rows: var(--_dry-area-grid-rows-xl);
			grid-template-areas: var(--_dry-area-grid-template-xl);
		}
	}
</style>
