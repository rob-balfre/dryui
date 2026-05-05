<script lang="ts">
	import { Button, Enter, Stagger } from '@dryui/ui';

	const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
	let nonce = $state(0);
</script>

<div class="stack">
	{#key nonce}
		<Stagger step="section" class="items">
			{#each items as item, index (item)}
				<Enter {index}>
					<div class="item">{item}</div>
				</Enter>
			{/each}
		</Stagger>
	{/key}

	<Button variant="outline" size="sm" onclick={() => (nonce += 1)}>Replay</Button>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}

	.stack :global(.items) {
		display: grid;
		gap: var(--dry-space-2);
		inline-size: 100%;
	}

	.item {
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-sm-size);
	}
</style>
