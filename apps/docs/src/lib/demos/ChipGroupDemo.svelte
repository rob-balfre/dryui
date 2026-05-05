<script lang="ts">
	import { ChipGroup } from '@dryui/ui';

	let selected = $state<string[]>(['one']);
</script>

<ChipGroup.Root type="multiple" bind:value={selected} gap="sm">
	<ChipGroup.Item value="one">Item 1</ChipGroup.Item>
	<ChipGroup.Item value="two">Item 2</ChipGroup.Item>
	<ChipGroup.Item value="three">Item 3</ChipGroup.Item>
</ChipGroup.Root>
