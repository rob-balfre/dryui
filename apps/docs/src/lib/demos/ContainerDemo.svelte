<script lang="ts">
	import { Container, Text } from '@dryui/ui';

	const sizes = [
		{ value: 'sm', maxWidth: '640px' },
		{ value: 'md', maxWidth: '768px' },
		{ value: 'lg', maxWidth: '1024px' },
		{ value: 'xl', maxWidth: '1280px' }
	] as const;
</script>

<div class="viewport">
	{#each sizes as { value, maxWidth } (value)}
		<Container size={value}>
			<div class="bar">
				<Text size="sm" weight="medium">size="{value}"</Text>
				<Text size="xs" color="secondary">max-width {maxWidth}</Text>
			</div>
		</Container>
	{/each}
</div>

<style>
	.viewport {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		background: repeating-linear-gradient(
			135deg,
			var(--dry-color-bg-raised),
			var(--dry-color-bg-raised) 8px,
			var(--dry-color-bg-base) 8px,
			var(--dry-color-bg-base) 16px
		);
	}

	.bar {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: space-between;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-sm);
		background: var(--dry-color-fill-brand-weak, var(--dry-color-bg-raised));
		border: 1px solid var(--dry-color-stroke-weak);
	}
</style>
