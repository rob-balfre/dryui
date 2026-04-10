<script lang="ts">
	import { Backdrop, Button, Card, Text } from '@dryui/ui';

	let open = $state(false);

	function closeBackdrop() {
		open = false;
	}

	function handleBackdropKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Escape') return;
		event.preventDefault();
		closeBackdrop();
	}
</script>

<div class="backdrop-demo">
	<Button variant="outline" onclick={() => (open = true)}>Show Backdrop</Button>
	<Text color="secondary">Open the preview to verify the backdrop blur and dismissal.</Text>
</div>

<Backdrop
	{open}
	role="button"
	tabindex={0}
	aria-label="Dismiss backdrop preview"
	onclick={closeBackdrop}
	onkeydown={handleBackdropKeyDown}
>
	<div
		class="backdrop-dialog"
		role="dialog"
		aria-modal="true"
		tabindex={-1}
		onclick={(event) => event.stopPropagation()}
		onkeydown={(event) => event.stopPropagation()}
	>
		<Card.Root>
			<Card.Content>
				<div class="backdrop-card-copy">
					<Text>Content rendered over a backdrop overlay layer.</Text>
					<Button onclick={closeBackdrop}>Close preview</Button>
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
