<script lang="ts">
	import { Button, Exit } from '@dryui/ui';

	let items = $state([
		{ id: 'a', label: 'Item 1' },
		{ id: 'b', label: 'Item 2' },
		{ id: 'c', label: 'Item 3' }
	]);

	function dismiss(id: string) {
		items = items.filter((item) => item.id !== id);
	}

	function reset() {
		items = [
			{ id: 'a', label: 'Item 1' },
			{ id: 'b', label: 'Item 2' },
			{ id: 'c', label: 'Item 3' }
		];
	}
</script>

<div class="stack">
	{#each items as item (item.id)}
		<Exit>
			<div class="block">
				<span>{item.label}</span>
				<Button variant="ghost" size="sm" onclick={() => dismiss(item.id)}>Dismiss</Button>
			</div>
		</Exit>
	{/each}

	{#if items.length === 0}
		<Button variant="outline" size="sm" onclick={reset}>Reset</Button>
	{/if}
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}

	.block {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-sm-size);
		min-inline-size: 18rem;
	}
</style>
