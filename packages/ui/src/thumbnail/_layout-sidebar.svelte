<script lang="ts">
	interface Props {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	let { x, y, width, height }: Props = $props();

	let lineX = $derived(x + 6);
	let lineW = $derived(width - 12);
	let firstLineY = $derived(y + 14);
</script>

<!-- Sidebar panel -->
<rect
	{x}
	{y}
	{width}
	{height}
	rx="0"
	fill="var(--dry-color-bg-raised)"
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<!-- Sidebar right divider -->
<line
	x1={x + width}
	y1={y}
	x2={x + width}
	y2={y + height}
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<!-- Active nav line -->
<rect
	x={lineX}
	y={firstLineY}
	width={lineW}
	height="4"
	rx="1"
	fill="var(--dry-color-fill-brand)"
	opacity="0.6"
/>
<!-- Nav line 2 -->
<rect
	x={lineX}
	y={firstLineY + 10}
	width={lineW}
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.4"
/>
<!-- Nav line 3 -->
<rect
	x={lineX}
	y={firstLineY + 20}
	width={lineW - 4}
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.4"
/>
<!-- Nav line 4 -->
<rect
	x={lineX}
	y={firstLineY + 30}
	width={lineW - 2}
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.4"
/>
