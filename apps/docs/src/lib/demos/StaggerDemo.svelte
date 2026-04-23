<script lang="ts">
	import { Badge, Stagger, Text } from '@dryui/ui';

	const steps = ['Plan migration', 'Run checks', 'Publish package'];
</script>

<Stagger as="div" step="section">
	{#each steps as step (step)}
		<div class="step">
			<Badge variant="soft">Step</Badge>
			<Text weight="semibold">{step}</Text>
		</div>
	{/each}
</Stagger>

<style>
	.step {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		background: var(--dry-color-bg-subtle);
		border-radius: var(--dry-radius-card);
	}

	.step + .step {
		margin-block-start: var(--dry-space-3);
	}
</style>
