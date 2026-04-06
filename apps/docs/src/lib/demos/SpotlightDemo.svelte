<script lang="ts">
	import { Spotlight, Heading, Text } from '@dryui/ui';
</script>

<div class="demo">
	<div class="card">
		<Spotlight>
			<div class="content">
				<Heading level={4}>Hover me</Heading>
				<Text color="secondary">The spotlight follows your pointer across the surface.</Text>
			</div>
		</Spotlight>
	</div>

	<div class="card">
		<Spotlight intensity={60} color="var(--dry-color-fill-brand)">
			<div class="content">
				<Heading level={4}>High intensity</Heading>
				<Text color="secondary">Boosted intensity with a brand-coloured glow.</Text>
			</div>
		</Spotlight>
	</div>
</div>

<style>
	.demo {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--dry-space-4);
	}

	.card {
		border-radius: var(--dry-radius-lg);
		border: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-raised);
	}

	.content {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-6);
	}
</style>
