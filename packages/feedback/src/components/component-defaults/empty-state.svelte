<script lang="ts">
	import { Button, Heading, Text } from '@dryui/ui';
</script>

<div class="empty-state">
	<header class="empty-state-header">
		<Heading level={3}>No projects yet</Heading>
	</header>
	<div class="empty-state-content">
		<Text>Create your first project to start collaborating with your team.</Text>
	</div>
	<footer class="empty-state-footer">
		<Button>New project</Button>
	</footer>
</div>

<style>
	.empty-state {
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-card);
		box-shadow: var(--dry-shadow-sm);
		overflow: hidden;
	}

	.empty-state-header {
		padding: var(--dry-padding-card);
		border-bottom: 1px solid var(--dry-color-stroke-weak);
	}

	.empty-state-content {
		padding: var(--dry-padding-card);
	}

	.empty-state-footer {
		padding: var(--dry-padding-card);
		border-top: 1px solid var(--dry-color-stroke-weak);
	}
</style>
