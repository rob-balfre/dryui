<script lang="ts">
	import { Beam } from '@dryui/ui';
</script>

<div class="grid">
	<Beam width={42} intensity={92} speed={3.6} angle={0}>
		<div class="surface"></div>
	</Beam>
	<Beam color="var(--dry-color-fill-success)" angle={-30} width={30} intensity={86} speed={4.2}>
		<div class="surface"></div>
	</Beam>
	<Beam color="var(--dry-color-fill-brand)" angle={90} width={48} intensity={82} speed={2.8}>
		<div class="surface"></div>
	</Beam>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: var(--dry-space-3);
	}

	.surface {
		aspect-ratio: 16 / 9;
		border-radius: var(--dry-radius-lg);
	}
</style>
