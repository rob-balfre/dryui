<script lang="ts">
	import { ChipGroup } from '@dryui/ui';

	let models = $state<string[]>(['gpt-4o']);
	let regions = $state<string[]>(['us-east', 'eu-west']);
</script>

<div class="stack">
	<section class="row">
		<p class="title">Route requests through</p>
		<ChipGroup.Root type="single" bind:value={models} gap="sm">
			<ChipGroup.Item value="gpt-4o">gpt-4o</ChipGroup.Item>
			<ChipGroup.Item value="claude-3.5">claude-3.5</ChipGroup.Item>
			<ChipGroup.Item value="gemini-1.5">gemini-1.5</ChipGroup.Item>
			<ChipGroup.Item value="llama-3.1">llama-3.1</ChipGroup.Item>
		</ChipGroup.Root>
	</section>

	<section class="row">
		<p class="title">Deploy regions</p>
		<ChipGroup.Root type="multiple" bind:value={regions} gap="sm">
			<ChipGroup.Item value="us-east">us-east-1</ChipGroup.Item>
			<ChipGroup.Item value="us-west">us-west-2</ChipGroup.Item>
			<ChipGroup.Item value="eu-west">eu-west-1</ChipGroup.Item>
			<ChipGroup.Item value="ap-southeast">ap-southeast-2</ChipGroup.Item>
			<ChipGroup.Item value="sa-east">sa-east-1</ChipGroup.Item>
		</ChipGroup.Root>
	</section>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.row {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
</style>
