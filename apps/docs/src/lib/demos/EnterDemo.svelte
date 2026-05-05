<script lang="ts">
	import { Button, Enter } from '@dryui/ui';

	let nonce = $state(0);
</script>

<div class="stack">
	{#key nonce}
		<Enter>
			<div class="block">Item 1</div>
		</Enter>
		<Enter>
			<div class="block">Item 2</div>
		</Enter>
		<Enter>
			<div class="block">Item 3</div>
		</Enter>
	{/key}
	<Button variant="outline" size="sm" onclick={() => (nonce += 1)}>Replay</Button>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}

	.block {
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-sm-size);
		min-inline-size: 12rem;
	}
</style>
