<script lang="ts">
	import { Button, Exit, Text } from '@dryui/ui';

	let visible = $state(true);
</script>

<div class="exit-demo">
	<Button variant="soft" onclick={() => (visible = !visible)}>
		{visible ? 'Hide update' : 'Show update'}
	</Button>

	{#if visible}
		<Exit>
			<div class="motion-panel">
				<Text weight="semibold">Release note queued</Text>
				<Text color="muted" size="sm">Exit keeps dismissal motion compact and asymmetric.</Text>
			</div>
		</Exit>
	{/if}
</div>

<style>
	.exit-demo {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}

	.motion-panel {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		background: var(--dry-color-bg-subtle);
		border-radius: var(--dry-radius-card);
	}
</style>
