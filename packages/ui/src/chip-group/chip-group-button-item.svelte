<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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

<Button
	variant="pill"
	size="sm"
	type="button"
	aria-pressed={selected}
	disabled={isDisabled}
	{...rest}
	onclick={handleClick}
>
	{@render children()}
</Button>
