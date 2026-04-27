<script lang="ts">
	import { AreaGrid, Button, Card } from '@dryui/ui';
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
	<Card.Root --dry-grid-area-name="masthead">
		<Card.Header>Ops Review</Card.Header>
		<Card.Content>Dashboard layout with every named area present</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="navigation" aria-label="Trial navigation">
		<Card.Content>
			<Button href="/components" variant="ghost">Components</Button>
			<Button href="/grid-rules" variant="ghost">Grid rules</Button>
			<Button href="/tools" variant="ghost">Tools</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="content">
		<Card.Header>Template areas as the only layout API</Card.Header>
		<Card.Content>
			<p>
				The page uses component parts, arbitrary area names, CSS custom properties, and no
				page-level style block.
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="insights">
		<Card.Header>Insights</Card.Header>
		<Card.Content>
			<p>Area names now come from the caller, not from a hardcoded component list.</p>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="foot">
		<Card.Content>Footer area</Card.Content>
	</Card.Root>
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
	<Card.Root --dry-grid-area-name="masthead">
		<Card.Header>Missing insights trial</Card.Header>
		<Card.Content>The layout still reserves the unclaimed named track.</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="navigation" aria-label="Missing-area navigation">
		<Card.Content>
			<Button href="/components/container" variant="ghost">Container</Button>
			<Button href="/components/splitter" variant="ghost">Splitter</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="content">
		<Card.Header>Empty template areas become layout holes</Card.Header>
		<Card.Content>
			<p>
				There is no consumer stylesheet here, but a declared template area without a matching
				--dry-grid-area-name child remains an intentional hole.
			</p>
		</Card.Content>
	</Card.Root>
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
	<Card.Root --dry-grid-area-name="tools">
		<Card.Header>Toolbar</Card.Header>
		<Card.Content>A named area only needs to exist in the CSS variable template.</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="summary">
		<Card.Header>Summary</Card.Header>
		<Card.Content>
			<p>Arbitrary names like summary, filters, or rail no longer require component support.</p>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="record">
		<Card.Header>Record</Card.Header>
		<Card.Content>
			<p>The component avoids consumer wrappers while still allowing semantic element choice.</p>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="notes">
		<Card.Header>Notes</Card.Header>
		<Card.Content>
			<p>The remaining sharp edge is keeping template strings and area variables in sync.</p>
		</Card.Content>
	</Card.Root>
</AreaGrid.Root>
