<script lang="ts">
	import { Container, Heading, Text } from '@dryui/ui';
</script>

<svelte:head>
	<title>My App</title>
</svelte:head>

<Container size="md" data-starter-container>
	<div class="starter-content">
		<Heading level={1}>Hello, World</Heading>
		<Text size="lg" color="muted">Your DryUI project is ready. Start building.</Text>
	</div>
</Container>

<style>
	[data-starter-container] {
		padding-block: var(--dry-space-16);
	}

	.starter-content {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
