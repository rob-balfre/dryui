<script lang="ts">
	import { Backdrop, Button, Card, Text } from '@dryui/ui';

	let open = $state(false);
</script>

<div class="backdrop-demo">
	<Button variant="outline" onclick={() => (open = true)}>Show Backdrop</Button>
	<Text color="secondary">Open the preview to verify the backdrop blur and dismissal.</Text>
</div>

<Backdrop {open} onclick={() => (open = false)}>
	<div class="backdrop-dialog" onclick={(event) => event.stopPropagation()}>
		<Card.Root>
			<Card.Content>
				<div class="backdrop-card-copy">
					<Text>Content rendered over a backdrop overlay layer.</Text>
					<Button onclick={() => (open = false)}>Close preview</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</Backdrop>

<style>
	.backdrop-demo {
		display: grid;
		justify-items: start;
		gap: var(--dry-space-3);
	}

	.backdrop-dialog {
		display: grid;
		grid-template-columns: min(28rem, 100%);
		justify-content: center;
	}

	.backdrop-card-copy {
		display: grid;
		justify-items: start;
		gap: var(--dry-space-4);
	}
</style>
