<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getChipGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, onclick, children, ...rest }: Props = $props();

	const group = getChipGroupCtx();
	const selected = $derived(group?.isSelected(value) ?? false);
	const isDisabled = $derived(Boolean(disabled || group?.disabled));

	const handleClick: NonNullable<Props['onclick']> = (event) => {
		if (isDisabled || !group) return;
		group.toggle(value);
		onclick?.(event);
	};
</script>

<button
	type="button"
	aria-pressed={selected}
	data-state={selected ? 'on' : 'off'}
	data-disabled={isDisabled || undefined}
	disabled={isDisabled}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</button>
