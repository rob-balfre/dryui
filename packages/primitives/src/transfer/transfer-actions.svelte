<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTransferCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?:
			| Snippet<
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
			  >
			| undefined;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getTransferCtx();

	let canMoveToTarget = $derived(ctx.selectedSourceCount > 0);
	let canMoveToSource = $derived(ctx.selectedTargetCount > 0);
</script>

<div data-transfer-actions {...rest}>
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
