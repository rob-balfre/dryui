<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		className?: HTMLAttributes<HTMLDivElement>['class'];
		close: () => void;
		disabled?: boolean;
		children: Snippet;
	}

	let { className, close, disabled, children, onclick, onkeydown, ...rest }: Props = $props();

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (onclick) {
			(onclick as (event: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
		}
		close();
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			e.currentTarget.click();
		}
		if (onkeydown) {
			(onkeydown as (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
		}
	}
</script>

<div
	role="menuitem"
	tabindex={disabled ? undefined : -1}
	aria-disabled={disabled || undefined}
	data-disabled={disabled || undefined}
	class={className}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	div {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-menu-item-padding, var(--dry-space-2_5) var(--dry-space-2));
		border-radius: var(
			--dry-menu-item-radius,
			min(var(--dry-control-radius, var(--dry-radius-sm)), var(--dry-space-4))
		);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		cursor: pointer;
		user-select: none;
		outline: none;
		color: var(--dry-color-text-strong);
		min-height: var(--dry-space-11);

		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-out),
			transform var(--dry-duration-fast) var(--dry-ease-out);

		@starting-style {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	div:hover:not([data-disabled]),
	div:focus-visible {
		background: var(--dry-color-fill);
	}

	div:active:not([data-disabled]) {
		background: var(--dry-color-fill-hover);
	}

	div[data-disabled] {
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
