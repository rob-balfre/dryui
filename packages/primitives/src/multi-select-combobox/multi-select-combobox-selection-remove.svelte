<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		label?: string | undefined;
	}

	let { value, label, onclick, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (ctx.disabled) {
			return;
		}

		ctx.removeValue(value);
		ctx.focusInput();

		if (onclick) {
			(onclick as (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(event);
		}
	}
</script>

<button
	type="button"
	aria-label={`Remove selection: ${label ?? value}`}
	disabled={ctx.disabled}
	data-disabled={ctx.disabled || undefined}
	onclick={handleClick}
	{...rest}
></button>
