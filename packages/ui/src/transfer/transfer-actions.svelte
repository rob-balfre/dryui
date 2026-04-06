<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTransferCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?: Snippet<
			[
				{
					moveToTarget: () => void;
					moveToSource: () => void;
					moveAllToTarget: () => void;
					moveAllToSource: () => void;
					canMoveToTarget: boolean;
					canMoveToSource: boolean;
				}
			]
		>;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getTransferCtx();

	let canMoveToTarget = $derived(ctx.selectedSourceCount > 0);
	let canMoveToSource = $derived(ctx.selectedTargetCount > 0);
</script>

<div data-part="actions" data-transfer-actions class={className} {...rest}>
	{#if children}
		{@render children({
			moveToTarget: () => ctx.moveToTarget(),
			moveToSource: () => ctx.moveToSource(),
			moveAllToTarget: () => ctx.moveAllToTarget(),
			moveAllToSource: () => ctx.moveAllToSource(),
			canMoveToTarget,
			canMoveToSource
		})}
	{:else}
		<button
			type="button"
			disabled={!canMoveToTarget}
			onclick={() => ctx.moveAllToTarget()}
			aria-label="Move all to target"
			data-transfer-move-all-target
		>
			&#8649;
		</button>
		<button
			type="button"
			disabled={!canMoveToTarget}
			onclick={() => ctx.moveToTarget()}
			aria-label="Move selected to target"
			data-transfer-move-target
		>
			&#8594;
		</button>
		<button
			type="button"
			disabled={!canMoveToSource}
			onclick={() => ctx.moveToSource()}
			aria-label="Move selected to source"
			data-transfer-move-source
		>
			&#8592;
		</button>
		<button
			type="button"
			disabled={!canMoveToSource}
			onclick={() => ctx.moveAllToSource()}
			aria-label="Move all to source"
			data-transfer-move-all-source
		>
			&#8647;
		</button>
	{/if}
</div>

<style>
	[data-part='actions'] {
		display: grid;
		place-items: center;
		gap: var(--dry-transfer-actions-gap, var(--dry-space-2));
		padding: 0 var(--dry-space-1);
	}

	[data-part='actions'] button {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-8);
		aspect-ratio: 1;
		border: 1px solid var(--dry-transfer-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-md);
		background: var(--dry-transfer-bg, var(--dry-color-bg-base));
		color: var(--dry-color-text-strong);
		font-size: var(--dry-type-small-size, var(--dry-text-base-size));
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='actions'] button:hover:not(:disabled) {
		background: var(--dry-color-fill-brand-weak);
		border-color: var(--dry-color-stroke-selected);
		color: var(--dry-color-text-brand);
	}

	[data-part='actions'] button:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: 2px;
	}

	[data-part='actions'] button:disabled {
		background: var(--dry-color-fill-disabled);
		border-color: var(--dry-color-stroke-disabled);
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}
</style>
