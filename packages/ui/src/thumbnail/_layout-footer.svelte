<script lang="ts">
	interface Props {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	let { x, y, width, height }: Props = $props();

	let textY = $derived(y + Math.round(height / 2) - 1);
</script>

<!-- Footer panel -->
<rect
	{x}
	{y}
	{width}
	{height}
	rx="3"
	fill="var(--dry-color-bg-raised)"
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<!-- Footer top divider -->
<line x1={x} y1={y} x2={x + width} y2={y} stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
<!-- Footer text -->
<rect
	x={x + 6}
	y={textY}
	width="18"
	height="3"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.4"
/>
<rect
	x={x + Math.round(width / 2) - 7}
	y={textY}
	width="14"
	height="3"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.4"
/>
<rect
	x={x + width - 24}
	y={textY}
	width="18"
	height="3"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.4"
/>
