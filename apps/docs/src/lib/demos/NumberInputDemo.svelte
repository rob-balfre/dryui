<script lang="ts">
	import { NumberInput, Field, Label } from '@dryui/ui';

	let concurrency = $state(4);
	let seats = $state(12);
	let retries = $state(3);
</script>

<div class="form">
	<Field.Root>
		<Label>Build concurrency</Label>
		<NumberInput bind:value={concurrency} min={1} max={16} step={1} />
		<Field.Description>Parallel jobs per runner. Pro plan caps at 16.</Field.Description>
	</Field.Root>

	<Field.Root>
		<Label>Editor seats</Label>
		<NumberInput bind:value={seats} min={1} max={500} step={1} />
		<Field.Description>
			Billed at $12 per seat per month. Current total: ${seats * 12}/mo.
		</Field.Description>
	</Field.Root>

	<Field.Root>
		<Label>Retry attempts on 5xx</Label>
		<NumberInput bind:value={retries} min={0} max={10} step={1} size="sm" />
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
