<script lang="ts">
	import { Reveal } from '@dryui/ui';
</script>

<div class="stack">
	<Reveal variant="slide-up" delay={0}>
		<div class="block">Item 1</div>
	</Reveal>
	<Reveal variant="slide-up" delay={90}>
		<div class="block">Item 2</div>
	</Reveal>
	<Reveal variant="slide-up" delay={180}>
		<div class="block">Item 3</div>
	</Reveal>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.block {
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
	}
</style>
