<script lang="ts">
	import { Badge, SystemMap, Text } from '@dryui/ui';
	import type { ArchitectureGraphData } from '$lib/architecture';

	interface Props {
		graph: ArchitectureGraphData;
		focusId?: string | null;
	}

	let { graph, focusId = null }: Props = $props();

	const relationshipBadges = $derived([
		{ label: 'Wraps', value: graph.summary.wrapEdges },
		{ label: 'Composes', value: graph.summary.composeEdges },
		{ label: 'Docs links', value: graph.summary.docsEdges },
		{ label: 'Related', value: graph.summary.relatedEdges }
	]);
</script>

<div class="system-map-layout">
	<div class="relationship-badges">
		{#each relationshipBadges as item (item.label)}
			<Badge variant="soft" color="gray">{item.label}: {item.value}</Badge>
		{/each}
	</div>

	<SystemMap {graph} {focusId} />

	<Text size="sm" color="secondary">
		The diagram renders the generated architecture artifact directly. Use the focus panel below to
		isolate one component at a time when the full graph gets dense.
	</Text>
</div>

<style>
	.system-map-layout {
		display: grid;
		gap: var(--dry-space-4);
	}

	.relationship-badges {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
