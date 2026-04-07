<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends HTMLLabelAttributes {
		children: Snippet;
		size?: 'sm' | 'md' | 'lg';
	}

	let { size = 'md', class: className, children, for: forProp, id, ...rest }: Props = $props();

	const ctx = getFormControlCtx();

	const labelFor = $derived(forProp ?? ctx?.id);
	const labelId = $derived(id ?? ctx?.labelId);
</script>

<label
	for={labelFor}
	id={labelId}
	data-disabled={ctx?.disabled || undefined}
	data-required={ctx?.required || undefined}
	data-size={size}
	class={className}
	{...rest}
>
	{@render children()}
</label>

<style>
	label {
		--dry-label-color: var(--dry-color-text-strong);
		--dry-label-font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		--dry-label-leading: var(--dry-type-small-leading, var(--dry-type-small-leading));
		--dry-label-weight: 500;

		order: var(--dry-field-label-order, unset);
		display: inline-block;
		font-family: var(--dry-font-sans);
		font-size: var(--dry-label-font-size);
		line-height: var(--dry-label-leading);
		font-weight: var(--dry-label-weight);
		color: var(--dry-label-color);
		cursor: pointer;

		&[data-disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&[data-required]::after {
			content: ' *';
			color: var(--dry-color-text-weak);
		}
	}

	/* Size variants */

	label[data-size='sm'] {
		--dry-label-font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
		--dry-label-leading: var(--dry-type-tiny-leading, var(--dry-type-tiny-leading));
	}

	label[data-size='md'] {
		--dry-label-font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		--dry-label-leading: var(--dry-type-small-leading, var(--dry-type-small-leading));
	}

	label[data-size='lg'] {
		--dry-label-font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		--dry-label-leading: var(--dry-type-small-leading, var(--dry-type-small-leading));
	}
</style>
