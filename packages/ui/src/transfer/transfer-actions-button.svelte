<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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
		<Button
			variant="outline"
			size="icon-sm"
			type="button"
			disabled={!canMoveToTarget}
			onclick={() => ctx.moveAllToTarget()}
			aria-label="Move all to target"
		>
			&#8649;
		</Button>
		<Button
			variant="outline"
			size="icon-sm"
			type="button"
			disabled={!canMoveToTarget}
			onclick={() => ctx.moveToTarget()}
			aria-label="Move selected to target"
		>
			&#8594;
		</Button>
		<Button
			variant="outline"
			size="icon-sm"
			type="button"
			disabled={!canMoveToSource}
			onclick={() => ctx.moveToSource()}
			aria-label="Move selected to source"
		>
			&#8592;
		</Button>
		<Button
			variant="outline"
			size="icon-sm"
			type="button"
			disabled={!canMoveToSource}
			onclick={() => ctx.moveAllToSource()}
			aria-label="Move all to source"
		>
			&#8647;
		</Button>
	{/if}
</div>

<style>
	[data-part='actions'] {
		display: grid;
		place-items: center;
		gap: var(--dry-transfer-actions-gap, var(--dry-space-2));
		padding: 0 var(--dry-space-1);
	}
</style>
