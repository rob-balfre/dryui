<script lang="ts">
	import { NumberInput, Field, Label, Text } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';

	let small = $state(1);
	let medium = $state(8);
	let large = $state(24);
	let quantity = $state(3);
</script>

<DocsDemo gap="xl">
	<div class="sizes">
		<div class="row">
			<Text size="xs" color="secondary" weight="medium">size="sm"</Text>
			<NumberInput bind:value={small} min={0} max={99} step={1} size="sm" />
		</div>
		<div class="row">
			<Text size="xs" color="secondary" weight="medium">size="md"</Text>
			<NumberInput bind:value={medium} min={0} max={99} step={1} size="md" />
		</div>
		<div class="row">
			<Text size="xs" color="secondary" weight="medium">size="lg"</Text>
			<NumberInput bind:value={large} min={0} max={99} step={1} size="lg" />
		</div>
	</div>

	<div class="card">
		<div class="card-info">
			<Text weight="semibold">Wireless headphones</Text>
			<Text size="sm" color="secondary">$129.00 each</Text>
		</div>
		<Field.Root>
			<Label>Quantity</Label>
			<NumberInput bind:value={quantity} min={1} max={10} step={1} />
		</Field.Root>
		<Text size="sm" color="secondary">Subtotal: ${(quantity * 129).toFixed(2)}</Text>
	</div>
</DocsDemo>

<style>
	.sizes {
		display: grid;
		gap: var(--dry-space-3);
	}

	.row {
		display: grid;
		grid-template-columns: 6rem max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.card {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		align-items: end;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
	}

	.card-info {
		display: grid;
		gap: var(--dry-space-1);
	}
</style>
