<script lang="ts">
	import { AreaGrid } from '@dryui/ui';
	import '../../../app.css';
</script>

<svelte:head>
	<title>AreaGrid Trial - DryUI</title>
</svelte:head>

<AreaGrid.Root
	gap="lg"
	padding="lg"
	debug
	aria-label="AreaGrid trial"
	--dry-area-grid-template-areas="'masthead' 'navigation' 'content' 'insights' 'foot'"
	--dry-area-grid-template-areas-wide="'masthead masthead masthead' 'navigation content insights' 'foot foot foot'"
	--dry-area-grid-template-columns-wide="14rem minmax(0, 1fr) 18rem"
>
	<AreaGrid.Area as="header" --dry-area-grid-area="masthead">
		<strong>Ops Review</strong>
		<span>Dashboard layout with every named area present</span>
	</AreaGrid.Area>

	<AreaGrid.Area as="nav" aria-label="Trial navigation" --dry-area-grid-area="navigation">
		<a href="/components">Components</a>
		<a href="/grid-rules">Grid rules</a>
		<a href="/tools">Tools</a>
	</AreaGrid.Area>

	<AreaGrid.Area as="main" --dry-area-grid-area="content">
		<h1>Template areas as the only layout API</h1>
		<p>
			The page uses component parts, arbitrary area names, CSS custom properties, and no page-level
			style block.
		</p>
	</AreaGrid.Area>

	<AreaGrid.Area as="aside" --dry-area-grid-area="insights">
		<strong>Insights</strong>
		<p>Area names now come from the caller, not from a hardcoded component list.</p>
	</AreaGrid.Area>

	<AreaGrid.Area as="footer" --dry-area-grid-area="foot">
		<small>Footer area</small>
	</AreaGrid.Area>
</AreaGrid.Root>

<AreaGrid.Root
	gap="lg"
	padding="lg"
	debug
	aria-label="AreaGrid missing area trial"
	--dry-area-grid-template-areas="'masthead' 'navigation' 'content' 'insights'"
	--dry-area-grid-template-areas-wide="'masthead masthead masthead' 'navigation content insights'"
	--dry-area-grid-template-columns-wide="14rem minmax(0, 1fr) 18rem"
>
	<AreaGrid.Area as="header" --dry-area-grid-area="masthead">
		<strong>Missing insights trial</strong>
		<span>The layout still reserves the unclaimed named track.</span>
	</AreaGrid.Area>

	<AreaGrid.Area as="nav" aria-label="Missing-area navigation" --dry-area-grid-area="navigation">
		<a href="/components/container">Container</a>
		<a href="/components/splitter">Splitter</a>
	</AreaGrid.Area>

	<AreaGrid.Area as="main" --dry-area-grid-area="content">
		<h2>Empty template areas become layout holes</h2>
		<p>
			There is no consumer stylesheet here, but a declared template area without a matching
			AreaGrid.Area remains an intentional hole.
		</p>
	</AreaGrid.Area>
</AreaGrid.Root>

<AreaGrid.Root
	gap="md"
	padding="lg"
	debug
	aria-label="AreaGrid detail trial"
	--dry-area-grid-template-areas="'tools' 'record' 'notes' 'summary'"
	--dry-area-grid-template-areas-wide="'tools tools tools' 'summary record notes'"
	--dry-area-grid-template-columns-wide="16rem minmax(0, 1fr) 16rem"
>
	<AreaGrid.Area as="section" --dry-area-grid-area="tools">
		<strong>Toolbar</strong>
		<span>A named area only needs to exist in the CSS variable template.</span>
	</AreaGrid.Area>

	<AreaGrid.Area as="article" --dry-area-grid-area="summary">
		<h2>Summary</h2>
		<p>Arbitrary names like summary, filters, or rail no longer require component support.</p>
	</AreaGrid.Area>

	<AreaGrid.Area as="article" --dry-area-grid-area="record">
		<h2>Record</h2>
		<p>The component avoids consumer div wrappers while still allowing semantic element choice.</p>
	</AreaGrid.Area>

	<AreaGrid.Area as="aside" --dry-area-grid-area="notes">
		<h2>Notes</h2>
		<p>The remaining sharp edge is keeping template strings and area variables in sync.</p>
	</AreaGrid.Area>
</AreaGrid.Root>
