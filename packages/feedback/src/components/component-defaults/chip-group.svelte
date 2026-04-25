<script lang="ts">
	import { ChipGroup } from '@dryui/ui';
</script>

<ChipGroup.Root type="multiple">
	<ChipGroup.Label>Filter by status</ChipGroup.Label>
	<ChipGroup.Item value="active">Active</ChipGroup.Item>
	<ChipGroup.Item value="paused">Paused</ChipGroup.Item>
	<ChipGroup.Item value="archived">Archived</ChipGroup.Item>
</ChipGroup.Root>
