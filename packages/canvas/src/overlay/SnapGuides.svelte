<script lang="ts">
	export interface SnapGuide {
		orientation: 'horizontal' | 'vertical';
		offset: number;
	}

	interface Props {
		guides?: SnapGuide[];
	}

	let { guides = [] }: Props = $props();
</script>

<div class="snap-guides" aria-hidden="true">
	{#each guides as guide, index (`${guide.orientation}-${guide.offset}-${index}`)}
		<div
			class={`guide guide-${guide.orientation}`}
			style={guide.orientation === 'vertical'
				? `left: ${guide.offset}px;`
				: `top: ${guide.offset}px;`}
		></div>
	{/each}
</div>

<style>
	.snap-guides {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}

	.guide {
		position: absolute;
		background: color-mix(in srgb, var(--dry-color-primary) 70%, white);
	}

	.guide-vertical {
		top: 0;
		bottom: 0;
		width: 1px;
	}

	.guide-horizontal {
		left: 0;
		right: 0;
		height: 1px;
	}
</style>
