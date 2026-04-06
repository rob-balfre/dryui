<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTransferCtx } from './context.svelte.js';
	import { Checkbox } from '../checkbox/index.js';

	interface Props extends HTMLAttributes<HTMLLabelElement> {
		key: string;
		type: 'source' | 'target';
		disabled?: boolean;
		children: Snippet;
	}

	let { key, type, disabled = false, children, ...rest }: Props = $props();

	const ctx = getTransferCtx();

	let selectedSet = $derived(type === 'source' ? ctx.selectedSource : ctx.selectedTarget);
	let isSelected = $derived(selectedSet.has(key));

	function toggle() {
		if (disabled) return;
		type === 'source' ? ctx.toggleSourceSelection(key) : ctx.toggleTargetSelection(key);
	}
</script>

<label
	role="option"
	data-transfer-item
	data-disabled={disabled ? '' : undefined}
	data-selected={isSelected ? '' : undefined}
	aria-selected={isSelected}
	aria-disabled={disabled}
	{...rest}
>
	<Checkbox checked={isSelected} {disabled} onchange={toggle} size="sm" />
	{@render children()}
</label>
