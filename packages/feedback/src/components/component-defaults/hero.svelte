<script lang="ts">
	import { Container, Heading, Text, Button } from '@dryui/ui';
</script>

<section>
	<Container>
		<div class="stack">
			<Heading level={1}>Build delightful interfaces, faster</Heading>
			<Text>A composable Svelte 5 component library tuned for product teams.</Text>
			<div class="actions">
				<Button>Get started</Button>
				<Button variant="ghost">View components</Button>
			</div>
		</div>
	</Container>
</section>

<style>
	section {
		padding-block: var(--dry-space-12, 3rem);
		background: var(--dry-color-bg-base);
	}

	.stack {
		display: grid;
		gap: var(--dry-space-4, 1rem);
		max-inline-size: 56ch;
	}

	.actions {
		display: flex;
		gap: var(--dry-space-3, 0.75rem);
		margin-block-start: var(--dry-space-2, 0.5rem);
	}
</style>
