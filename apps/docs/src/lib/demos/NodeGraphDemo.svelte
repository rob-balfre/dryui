<script lang="ts">
	import { NodeGraph } from '@dryui/ui';
</script>

<NodeGraph.Root viewWidth={500} viewHeight={300}>
	<NodeGraph.Cluster x={10} y={10} clusterWidth={200} clusterHeight={140} label="Research" color="info">
		<NodeGraph.Node id="analyzer" x={70} y={60} color="info">Analyzer</NodeGraph.Node>
		<NodeGraph.Node id="mapper" x={150} y={60} color="info">Mapper</NodeGraph.Node>
		<NodeGraph.Node id="recognizer" x={110} y={120} color="info">Recognizer</NodeGraph.Node>
	</NodeGraph.Cluster>

	<NodeGraph.Cluster x={280} y={10} clusterWidth={200} clusterHeight={140} label="Execution" color="success">
		<NodeGraph.Node id="planner" x={340} y={60} color="brand" state="active">Planner</NodeGraph.Node>
		<NodeGraph.Node id="worker" x={420} y={60} color="success" state="complete">Worker</NodeGraph.Node>
		<NodeGraph.Node id="reviewer" x={380} y={120} color="warning">Reviewer</NodeGraph.Node>
	</NodeGraph.Cluster>

	<NodeGraph.Node id="debugger" x={250} y={240} state="blocked">Debugger</NodeGraph.Node>

	<NodeGraph.Edge from="analyzer" to="planner" />
	<NodeGraph.Edge from="mapper" to="planner" />
	<NodeGraph.Edge from="recognizer" to="planner" />
	<NodeGraph.Edge from="planner" to="worker" />
	<NodeGraph.Edge from="worker" to="reviewer" />
	<NodeGraph.Edge from="reviewer" to="debugger" dashed label="issues" />
</NodeGraph.Root>
