<script lang="ts">
	import type { ActionReturn } from 'svelte/action';
	import type { Rect } from '../types.js';

	interface Props {
		rect: Rect | null;
		label?: string;
	}

	let { rect, label }: Props = $props();

	function applyRect(node: HTMLElement, rect: Rect): ActionReturn<Rect> {
		function update(r: Rect) {
			node.style.setProperty('left', `${r.x}px`);
			node.style.setProperty('top', `${r.y}px`);
			node.style.setProperty('width', `${r.width}px`);
			node.style.setProperty('height', `${r.height}px`);
		}

		update(rect);

		return { update };
	}
</script>

{#if rect}
	<div data-feedback-highlight data-dryui-feedback use:applyRect={rect}>
		{#if label}
			<span class="label">
				{label}
			</span>
		{/if}
	</div>
{/if}

<style>
	[data-feedback-highlight] {
		position: fixed;
		background: var(--dry-color-fill-brand-weak, rgba(99, 102, 241, 0.1));
		border: 2px solid var(--dry-color-stroke-brand, rgba(99, 102, 241, 0.5));
		border-radius: var(--dry-radius-sm, 4px);
		pointer-events: none;
		z-index: 9999;
	}

	.label {
		position: absolute;
		top: -22px;
		left: 0;
		background: var(--dry-color-fill-brand);
		color: var(--dry-color-on-brand, #fff);
		font-size: 11px;
		padding: 1px 6px;
		border-radius: var(--dry-radius-sm, 4px);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
