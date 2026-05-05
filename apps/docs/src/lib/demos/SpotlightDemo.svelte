<script lang="ts">
	import { Spotlight } from '@dryui/ui';
</script>

<Spotlight radius={320} intensity={32} color="rgba(96, 165, 250, 0.28)">
	<div class="surface">Hover to see the spotlight follow your cursor.</div>
</Spotlight>

<style>
	.surface {
		display: grid;
		place-items: center;
		min-block-size: 12rem;
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-xl);
		color: var(--dry-color-text-strong);
	}
</style>
