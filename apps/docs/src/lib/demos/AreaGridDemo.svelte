<script lang="ts">
	import { AreaGrid, Card } from '@dryui/ui';
</script>

<AreaGrid.Root
	gap="sm"
	debug
	--dry-area-grid-template-areas="'masthead' 'nav' 'content' 'aside' 'foot'"
	--dry-area-grid-template-areas-wide="'masthead masthead masthead' 'nav content aside' 'foot foot foot'"
	--dry-area-grid-template-columns-wide="12rem minmax(0, 1fr) 16rem"
>
	<Card.Root --dry-grid-area-name="masthead">
		<Card.Header>Release desk</Card.Header>
		<Card.Content>All areas populated</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="nav" aria-label="Release desk">
		<Card.Header>Queue</Card.Header>
		<Card.Content>Signals and history</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="content">
		<Card.Header>Main</Card.Header>
		<Card.Content>
			<p>Template areas work cleanly while component area variables use matching names.</p>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="aside">
		<Card.Header>Aside</Card.Header>
		<Card.Content>
			<p>Optional regions need a deliberate template or they leave reserved tracks.</p>
		</Card.Content>
	</Card.Root>

	<Card.Root --dry-grid-area-name="foot">
		<Card.Content>Footer</Card.Content>
	</Card.Root>
</AreaGrid.Root>
