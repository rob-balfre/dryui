<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		orientation = 'horizontal',
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<div
	role="group"
	data-button-group
	data-orientation={orientation}
	data-size={size}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-button-group] {
		--dry-button-group-radius: var(--dry-radius-md);
		--dry-button-group-hover-z-index: 1;

		display: inline-grid;
		gap: var(--dry-button-group-gap, 0px);
	}

	[data-button-group][data-orientation='horizontal'] {
		grid-auto-flow: column;

		& > :where(button, a, span),
		& > :where(span) > :where(button, a) {
			border-radius: 0;
		}

		& > :where(button, a):first-child,
		& > :where(span):first-child > :where(button, a) {
			border-top-left-radius: var(--dry-button-group-radius);
			border-bottom-left-radius: var(--dry-button-group-radius);
		}

		& > :where(button, a):last-child,
		& > :where(span):last-child > :where(button, a) {
			border-top-right-radius: var(--dry-button-group-radius);
			border-bottom-right-radius: var(--dry-button-group-radius);
		}

		& > :where(button, a):not(:first-child),
		& > :where(span):not(:first-child) > :where(button, a) {
			border-inline-start: 0;
		}

		& > :where(button, a):hover,
		& > :where(button, a):focus-visible,
		& > :where(span):hover > :where(button, a),
		& > :where(span):focus-within > :where(button, a) {
			z-index: var(--dry-button-group-hover-z-index);
			position: relative;
		}
	}

	[data-button-group][data-orientation='vertical'] {
		& > :where(button, a, span),
		& > :where(span) > :where(button, a) {
			border-radius: 0;
		}

		& > :where(button, a):first-child,
		& > :where(span):first-child > :where(button, a) {
			border-top-left-radius: var(--dry-button-group-radius);
			border-top-right-radius: var(--dry-button-group-radius);
		}

		& > :where(button, a):last-child,
		& > :where(span):last-child > :where(button, a) {
			border-bottom-left-radius: var(--dry-button-group-radius);
			border-bottom-right-radius: var(--dry-button-group-radius);
		}

		& > :where(button, a):not(:first-child),
		& > :where(span):not(:first-child) > :where(button, a) {
			border-block-start: 0;
		}

		& > :where(button, a):hover,
		& > :where(button, a):focus-visible,
		& > :where(span):hover > :where(button, a),
		& > :where(span):focus-within > :where(button, a) {
			z-index: var(--dry-button-group-hover-z-index);
			position: relative;
		}
	}

	[data-button-group][data-size='sm'] {
		--dry-button-group-radius: var(--dry-radius-sm);
	}

	[data-button-group][data-size='md'] {
		--dry-button-group-radius: var(--dry-radius-md);
	}

	[data-button-group][data-size='lg'] {
		--dry-button-group-radius: var(--dry-radius-lg);
	}
</style>
