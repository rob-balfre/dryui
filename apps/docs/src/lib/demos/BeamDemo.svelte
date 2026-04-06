<script lang="ts">
	import { Beam, Text } from '@dryui/ui';
</script>

<div class="demo-grid">
	<Beam width={40} intensity={90} speed={4}>
		<div class="demo-card">
			<Text weight="semibold">Default beam</Text>
			<Text color="secondary" size="sm">Brand color, 45° angle</Text>
		</div>
	</Beam>

	<Beam color="var(--dry-color-fill-success)" angle={-30} width={30} intensity={85} speed={5}>
		<div class="demo-card">
			<Text weight="semibold">Custom color &amp; angle</Text>
			<Text color="secondary" size="sm">Green, -30°</Text>
		</div>
	</Beam>

	<Beam color="var(--dry-color-fill-error)" angle={90} width={50} intensity={80} speed={3}>
		<div class="demo-card">
			<Text weight="semibold">Vertical sweep</Text>
			<Text color="secondary" size="sm">Red, 90° angle</Text>
		</div>
	</Beam>
</div>

<style>
	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--dry-space-4);
	}

	.demo-card {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-raised);
	}
</style>
