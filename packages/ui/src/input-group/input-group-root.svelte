<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		invalid?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		size = 'md',
		disabled = false,
		invalid = false,
		orientation = 'horizontal',
		children,
		class: className,
		...rest
	}: Props = $props();

	setAffixGroupCtx({
		get size() {
			return size;
		},
		get disabled() {
			return disabled;
		},
		get invalid() {
			return invalid;
		},
		get orientation() {
			return orientation;
		}
	});
</script>

<div
	data-affix-group
	data-input-group-root
	data-size={size}
	data-disabled={disabled || undefined}
	data-invalid={invalid || undefined}
	data-orientation={orientation}
	{...rest}
	class={className}
>
	{@render children()}
</div>

<style>
	[data-input-group-root] {
		--dry-input-group-bg: var(--dry-input-bg, var(--dry-color-bg-base));
		--dry-input-group-border: var(--dry-input-border, var(--dry-color-stroke-weak));
		--dry-input-group-border-strong: var(--dry-color-stroke-strong);
		--dry-input-group-color: var(--dry-input-color, var(--dry-color-text-strong));
		--dry-input-group-muted: var(--dry-color-text-weak);
		--dry-input-group-radius: var(--dry-input-radius, var(--dry-radius-md));
		--dry-input-group-padding-x: var(--dry-input-padding-x, 0.875rem);
		--dry-input-group-padding-y: var(--dry-input-padding-y, 0.625rem);
		--dry-input-group-font-size: var(--dry-input-font-size, 0.95rem);
		--dry-input-group-gap: 0.5rem;
		--dry-input-group-separator: color-mix(in srgb, var(--dry-input-group-border) 80%, transparent);

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: stretch;
		min-height: 3rem;
		border: 1px solid var(--dry-input-group-border);
		border-radius: var(--dry-input-group-radius);
		background: var(--dry-input-group-bg);
		color: var(--dry-input-group-color);
		overflow: hidden;
	}

	[data-input-group-root]:focus-within {
		border-color: var(--dry-input-group-border-strong);
		box-shadow: 0 0 0 1px var(--dry-input-group-border-strong);
	}

	[data-input-group-root][data-invalid] {
		border-color: var(--dry-color-fill-error);
		box-shadow: 0 0 0 1px var(--dry-color-fill-error);
	}

	[data-input-group-root][data-disabled] {
		opacity: 0.72;
	}

	[data-input-group-root][data-size='sm'] {
		min-height: 2.5rem;
	}

	[data-input-group-root][data-size='lg'] {
		min-height: 3.5rem;
	}

</style>
