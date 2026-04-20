<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		disabled?: boolean;
		onSelect?: () => void;
		children: Snippet;
	}

	let { disabled, onSelect, children, onclick, onkeydown, ...rest }: Props = $props();

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
		onSelect?.();
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			(e.currentTarget as HTMLElement).click();
		}
		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	role="menuitem"
	tabindex={disabled ? undefined : -1}
	aria-disabled={disabled || undefined}
	data-disabled={disabled || undefined}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
