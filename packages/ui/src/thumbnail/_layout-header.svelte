<script lang="ts">
	interface Props {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	let { x, y, width, height }: Props = $props();

	let logoW = $derived(14);
	let logoH = $derived(height - 8);
	let logoX = $derived(x + 6);
	let logoY = $derived(y + 4);
	let navY = $derived(y + Math.round(height / 2) - 2);
	let navStartX = $derived(logoX + logoW + 8);
</script>

<!-- Header panel -->
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
<!-- Header bottom divider -->
<line
	x1={x}
	y1={y + height}
	x2={x + width}
	y2={y + height}
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<!-- Logo -->
<rect
	x={logoX}
	y={logoY}
	width={logoW}
	height={logoH}
	rx="1"
	fill="var(--dry-color-fill-brand)"
	opacity="0.7"
/>
<!-- Nav items -->
<rect
	x={navStartX}
	y={navY}
	width="10"
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.5"
/>
<rect
	x={navStartX + 14}
	y={navY}
	width="10"
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.5"
/>
<rect
	x={navStartX + 28}
	y={navY}
	width="10"
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.5"
/>
