<script lang="ts">
	import { ArchitectureDiagram } from '@dryui/ui';
</script>

<ArchitectureDiagram.Root>
	<ArchitectureDiagram.Group position="start" label="Guides (Feedforward)" color="info">
		<ArchitectureDiagram.Item>Documentation</ArchitectureDiagram.Item>
		<ArchitectureDiagram.Item>Rules</ArchitectureDiagram.Item>
		<ArchitectureDiagram.Item>Tools</ArchitectureDiagram.Item>
	</ArchitectureDiagram.Group>

	<ArchitectureDiagram.Center>Coding Agent</ArchitectureDiagram.Center>

	<ArchitectureDiagram.Group position="end" label="Sensors (Feedback)" color="success">
		<ArchitectureDiagram.Item>Linters</ArchitectureDiagram.Item>
		<ArchitectureDiagram.Item>Review Agents</ArchitectureDiagram.Item>
		<ArchitectureDiagram.Item>Logs</ArchitectureDiagram.Item>
	</ArchitectureDiagram.Group>
</ArchitectureDiagram.Root>
