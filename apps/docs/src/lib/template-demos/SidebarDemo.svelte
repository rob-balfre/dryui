<script lang="ts">
	import { AreaGrid } from '@dryui/ui';
</script>

<AreaGrid.Root
	debug
	template="sidebar"
	maxWidth="full"
	--dry-area-grid-template-rows="minmax(0, 1fr)"
>
	<AreaGrid.Placeholder area="aside" />
	<AreaGrid.Placeholder area="main" />
</AreaGrid.Root>
