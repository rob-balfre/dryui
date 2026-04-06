<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLLabelAttributes {
		children: Snippet;
	}

	let { children, for: forProp, id, ...rest }: Props = $props();

	const ctx = getFormControlCtx();

	const labelFor = $derived(forProp ?? ctx?.id);
	const labelId = $derived(id ?? ctx?.labelId);
</script>

<label
	for={labelFor}
	id={labelId}
	data-disabled={ctx?.disabled || undefined}
	data-required={ctx?.required || undefined}
	{...rest}
>
	{@render children()}
</label>
