<script>
	import { ChipGroup } from '@dryui/ui';

	let selectedFilters = $state([]);
</script>

<ChipGroup.Root type="multiple" bind:value={selectedFilters}>
	<ChipGroup.Item value="direct">Direct</ChipGroup.Item>
	<ChipGroup.Item value="flexible">Flexible</ChipGroup.Item>
	<ChipGroup.Item value="wifi">Wi-fi</ChipGroup.Item>
</ChipGroup.Root>
