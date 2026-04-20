<script lang="ts">
	import { AppFrame, Button, Text } from '@dryui/ui';
</script>

<AppFrame title="agent.chat">
	{#snippet actions()}
		<Button size="sm" variant="ghost">Deploy</Button>
	{/snippet}

	<div class="frame-content">
		<Text weight="medium">Draft response</Text>
		<Text size="sm" color="secondary">
			AppFrame wraps content with lightweight app chrome for previews, dashboards, and shell-like
			layouts.
		</Text>
	</div>
</AppFrame>

<style>
	.frame-content {
		display: grid;
		gap: var(--dry-space-2);
		align-content: start;
		min-block-size: 12rem;
		padding: var(--dry-space-5);
	}
</style>
