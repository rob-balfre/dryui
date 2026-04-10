<script lang="ts">
	import { CycleDiagram } from '@dryui/ui';
</script>

<div class="cycle-wrapper">
	<CycleDiagram.Root phaseCount={4} label="Atomic Flywheel">
		<CycleDiagram.Phase color="brand">Research</CycleDiagram.Phase>
		<CycleDiagram.Phase color="info">Spec</CycleDiagram.Phase>
		<CycleDiagram.Phase color="success">Implement</CycleDiagram.Phase>
		<CycleDiagram.Phase color="warning">Review</CycleDiagram.Phase>
	</CycleDiagram.Root>
</div>

<style>
	.cycle-wrapper {
		display: grid;
		max-height: 320px;
	}
</style>
