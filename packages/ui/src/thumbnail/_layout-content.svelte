<script lang="ts">
	interface Props {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	let { x, y, width, height }: Props = $props();

	let cardW = $derived(Math.round((width - 10) / 2));
	let cardX2 = $derived(x + cardW + 5);
	let cardY = $derived(y + 30);
	let cardH = $derived(Math.max(1, Math.min(16, Math.round((height - 36) / 2) - 2)));
	let card2Y = $derived(cardY + cardH + 4);
	let card2H = $derived(Math.max(10, y + height - card2Y - 2));
</script>

<!-- Heading -->
<rect
	{x}
	{y}
	width={Math.round(width * 0.45)}
	height="7"
	rx="2"
	fill="var(--dry-color-text-weak)"
	opacity="0.5"
/>
<!-- Paragraph lines -->
<rect
	{x}
	y={y + 12}
	width={Math.round(width * 0.75)}
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.3"
/>
<rect
	{x}
	y={y + 19}
	width={Math.round(width * 0.65)}
	height="4"
	rx="1"
	fill="var(--dry-color-text-weak)"
	opacity="0.3"
/>
<!-- Card row 1 -->
<rect
	{x}
	y={cardY}
	width={cardW}
	height={cardH}
	rx="2"
	fill="var(--dry-color-bg-raised)"
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<rect
	x={cardX2}
	y={cardY}
	width={cardW}
	height={cardH}
	rx="2"
	fill="var(--dry-color-bg-raised)"
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<!-- Card row 2 -->
<rect
	{x}
	y={card2Y}
	width={cardW}
	height={card2H}
	rx="2"
	fill="var(--dry-color-bg-raised)"
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
<rect
	x={cardX2}
	y={card2Y}
	width={cardW}
	height={card2H}
	rx="2"
	fill="var(--dry-color-bg-raised)"
	stroke="var(--dry-color-stroke-weak)"
	stroke-width="1"
/>
