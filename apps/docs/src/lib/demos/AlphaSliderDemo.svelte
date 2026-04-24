<script lang="ts">
	import { AlphaSlider, Field, Label } from '@dryui/ui';

	let overlay = $state(72);
	let watermark = $state(28);
</script>

<div class="stack">
	<Field.Root>
		<Label>Modal backdrop opacity</Label>
		<AlphaSlider bind:value={overlay} color="hsl(222, 18%, 14%)" />
		<p class="meta">Backdrop renders at {overlay}% over the page.</p>
	</Field.Root>

	<Field.Root>
		<Label>Export watermark alpha</Label>
		<AlphaSlider bind:value={watermark} color="hsl(24, 94%, 58%)" />
		<p class="meta">Watermark prints at {watermark}% on exported PDFs.</p>
	</Field.Root>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-5);
	}

	.meta {
		margin: var(--dry-space-1) 0 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}
</style>
