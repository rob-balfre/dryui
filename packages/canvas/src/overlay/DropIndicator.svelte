<script lang="ts">
	export interface DropIndicatorRect {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface Props {
		indicator?: DropIndicatorRect | null;
	}

	let { indicator = null }: Props = $props();
</script>

{#if indicator}
	<div
		class="drop-indicator"
		aria-hidden="true"
		style={`transform: translate(${indicator.x}px, ${indicator.y}px); width: ${indicator.width}px; height: ${indicator.height}px;`}
	></div>
{/if}

<style>
	.drop-indicator {
		position: absolute;
		border: 2px solid var(--dry-color-primary);
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, var(--dry-color-primary) 14%, transparent);
		pointer-events: none;
		z-index: 3;
	}
</style>
