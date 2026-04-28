<script lang="ts">
	import { AreaGrid } from '@dryui/ui';
	import '../../../app.css';
</script>

<svelte:head>
	<title>Layout inspector trial</title>
</svelte:head>

<AreaGrid.Root
	fill
	--dry-area-grid-template-areas="'masthead' 'nav' 'main' 'aside' 'foot'"
	--dry-area-grid-template-areas-wide="'masthead masthead masthead' 'nav main aside' 'foot foot foot'"
	--dry-area-grid-template-columns-wide="14rem minmax(0, 1fr) 18rem"
	--dry-area-grid-template-rows-wide="auto minmax(20rem, 1fr) auto"
>
	<AreaGrid.Placeholder area="masthead" />
	<AreaGrid.Placeholder area="nav" />
	<AreaGrid.Placeholder area="main" />
	<AreaGrid.Placeholder area="aside" />
	<AreaGrid.Placeholder area="foot" />
</AreaGrid.Root>
