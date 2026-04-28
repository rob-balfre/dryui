<script lang="ts">
	import './area-grid-root.css';

	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type AreaGridMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		maxWidth?: AreaGridMaxWidth;
		fill?: boolean;
		debug?: boolean;
		children: Snippet;
	}

	let {
		maxWidth = 'xl',
		fill = false,
		debug = false,
		children,
		class: className,
		...rest
	}: Props = $props();
</script>

<section
	data-area-grid-shell
	data-max-width={maxWidth}
	data-fill={fill || undefined}
	class={className}
	{...rest}
>
	<section data-area-grid data-debug={debug || undefined}>
		{@render children()}
	</section>
</section>

<style>
	[data-area-grid-shell] {
		--_dry-area-grid-max-inline-size: 80rem;

		container-type: inline-size;
		display: grid;
		inline-size: min(100% - 2rem, var(--_dry-area-grid-max-inline-size));
		margin-inline: auto;
	}

	[data-area-grid-shell][data-max-width='sm'] {
		--_dry-area-grid-max-inline-size: 40rem;
	}

	[data-area-grid-shell][data-max-width='md'] {
		--_dry-area-grid-max-inline-size: 48rem;
	}

	[data-area-grid-shell][data-max-width='lg'] {
		--_dry-area-grid-max-inline-size: 64rem;
	}

	[data-area-grid-shell][data-max-width='xl'] {
		--_dry-area-grid-max-inline-size: 80rem;
	}

	[data-area-grid-shell][data-max-width='2xl'] {
		--_dry-area-grid-max-inline-size: 96rem;
	}

	[data-area-grid-shell][data-max-width='full'] {
		inline-size: 100%;
	}

	[data-area-grid-shell][data-fill] {
		min-block-size: 100dvh;
	}

	[data-area-grid-shell][data-fill] > [data-area-grid] {
		min-block-size: 100%;
	}

	[data-area-grid] {
		--dry-grid-area-name: auto;
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
		box-sizing: border-box;
		grid-template-columns: var(--_dry-area-grid-columns);
		grid-template-rows: var(--_dry-area-grid-rows);
		grid-template-areas: var(--_dry-area-grid-template);
		grid-auto-flow: var(--_dry-area-grid-auto-flow);
		grid-auto-rows: var(--_dry-area-grid-auto-rows);
		align-items: var(--_dry-area-grid-align-items);
		justify-items: var(--_dry-area-grid-justify-items);
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
