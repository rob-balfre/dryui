<script lang="ts">
	import { LogoMark, Text } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';
</script>

<DocsDemo
	title="LogoMark"
	description="Brand mark, status indicator, or category badge with image or fallback text."
	gap="xl"
>
	<div class="row">
		<LogoMark fallback="Acme Rockets" size="sm" />
		<LogoMark fallback="Acme Rockets" size="md" />
		<LogoMark fallback="Acme Rockets" size="lg" />
		<Text size="sm" color="secondary">Sizes: sm, md, lg</Text>
	</div>

	<div class="row">
		<LogoMark fallback="Northwind" shape="square" />
		<LogoMark fallback="Northwind" shape="rounded" />
		<LogoMark fallback="Northwind" shape="circle" />
		<Text size="sm" color="secondary">Shapes: square, rounded, circle</Text>
	</div>

	<div class="row">
		<LogoMark fallback="Archive" color="neutral" />
		<LogoMark fallback="Brand" color="brand" />
		<LogoMark fallback="Error" color="error" />
		<LogoMark fallback="Warn" color="warning" />
		<LogoMark fallback="Done" color="success" />
		<LogoMark fallback="Info" color="info" />
		<Text size="sm" color="secondary">Tone conveys meaning</Text>
	</div>

	<div class="row">
		<LogoMark
			src="https://images.unsplash.com/photo-1557683316-973673baf926?w=80&h=80&fit=crop"
			alt="Planet Supplies"
			size="lg"
		/>
		<LogoMark fallback="MJ" alt="Maria Jensen" size="lg" color="brand" shape="circle" />
		<LogoMark fallback="FB" alt="Fallback initials" size="lg" />
		<Text size="sm" color="secondary">Image and text fallbacks</Text>
	</div>
</DocsDemo>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-6);
	}
</style>
