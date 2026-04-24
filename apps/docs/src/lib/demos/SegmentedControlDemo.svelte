<script lang="ts">
	import { SegmentedControl, Field, Label } from '@dryui/ui';

	let range = $state('7d');
	let mode = $state('chart');
</script>

<div class="stack">
	<Field.Root>
		<Label>Time range</Label>
		<SegmentedControl.Root bind:value={range}>
			<SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
			<SegmentedControl.Item value="7d">7d</SegmentedControl.Item>
			<SegmentedControl.Item value="30d">30d</SegmentedControl.Item>
			<SegmentedControl.Item value="90d">90d</SegmentedControl.Item>
			<SegmentedControl.Item value="custom">Custom</SegmentedControl.Item>
		</SegmentedControl.Root>
	</Field.Root>

	<Field.Root>
		<Label>View mode</Label>
		<SegmentedControl.Root bind:value={mode}>
			<SegmentedControl.Item value="chart">Chart</SegmentedControl.Item>
			<SegmentedControl.Item value="table">Table</SegmentedControl.Item>
			<SegmentedControl.Item value="raw">Raw JSON</SegmentedControl.Item>
		</SegmentedControl.Root>
	</Field.Root>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
