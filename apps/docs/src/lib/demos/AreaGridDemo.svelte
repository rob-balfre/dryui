<script lang="ts">
	import { AreaGrid } from '@dryui/ui';
</script>

<AreaGrid.Root
	gap="sm"
	debug
	--dry-area-grid-template-areas="'masthead' 'nav' 'content' 'aside' 'foot'"
	--dry-area-grid-template-areas-wide="'masthead masthead masthead' 'nav content aside' 'foot foot foot'"
	--dry-area-grid-template-columns-wide="12rem minmax(0, 1fr) 16rem"
>
	<AreaGrid.Area as="header" --dry-area-grid-area="masthead">
		<strong>Release desk</strong>
		<span>All areas populated</span>
	</AreaGrid.Area>

	<AreaGrid.Area as="nav" aria-label="Release desk" --dry-area-grid-area="nav">
		<span>Queue</span>
		<span>Signals</span>
		<span>History</span>
	</AreaGrid.Area>

	<AreaGrid.Area as="main" --dry-area-grid-area="content">
		<strong>Main</strong>
		<p>Template areas work cleanly while variables and Area parts use matching names.</p>
	</AreaGrid.Area>

	<AreaGrid.Area as="aside" --dry-area-grid-area="aside">
		<strong>Aside</strong>
		<p>Optional regions need a deliberate template or they leave reserved tracks.</p>
	</AreaGrid.Area>

	<AreaGrid.Area as="footer" --dry-area-grid-area="foot">
		<small>Footer</small>
	</AreaGrid.Area>
</AreaGrid.Root>
