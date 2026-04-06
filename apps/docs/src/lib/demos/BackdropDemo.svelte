<script lang="ts">
	import { Backdrop, Button, Card, Text } from '@dryui/ui';

	let open = $state(false);
</script>

<div class="backdrop-demo">
	<Button variant="outline" onclick={() => (open = true)}>Show Backdrop</Button>
	<Text color="secondary">Open the preview to verify the backdrop blur and dismissal.</Text>
</div>

<Backdrop {open} onclick={() => (open = false)}>
	<Card.Root onclick={(event) => event.stopPropagation()}>
		<Card.Content>
			<div class="backdrop-card-copy">
				<Text>Content rendered over a backdrop overlay layer.</Text>
				<Button onclick={() => (open = false)}>Close preview</Button>
			</div>
		</Card.Content>
	</Card.Root>
</Backdrop>

<style>
	.backdrop-demo {
		display: grid;
		justify-items: start;
		gap: var(--dry-space-3);
	}

	.backdrop-card-copy {
		display: grid;
		justify-items: start;
		gap: var(--dry-space-4);
	}
</style>
