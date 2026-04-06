<script lang="ts">
	import { SegmentedControl } from '@dryui/ui';

	let tripType = $state('round-trip');
</script>

<SegmentedControl.Root bind:value={tripType}>
	<SegmentedControl.Item value="one-way">One way</SegmentedControl.Item>
	<SegmentedControl.Item value="round-trip">Round trip</SegmentedControl.Item>
	<SegmentedControl.Item value="multi-city">Multi-city</SegmentedControl.Item>
</SegmentedControl.Root>
