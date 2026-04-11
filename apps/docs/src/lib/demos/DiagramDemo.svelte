<script lang="ts">
	import { Diagram } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';

	const config: DiagramConfig = {
		direction: 'LR',
		nodes: [
			{ id: 'app', label: 'APP', variant: 'filled' },
			{ id: 'vector', label: 'VECTOR', variant: 'filled' },
			{ id: 'logs', label: 'Victoria Logs' },
			{ id: 'metrics', label: 'Victoria Metrics' },
			{ id: 'traces', label: 'Victoria Traces' },
			{ id: 'logql', label: 'LogQL API' },
			{ id: 'promql', label: 'PromQL API' },
			{ id: 'traceql', label: 'TraceQL API' },
			{ id: 'codex', label: 'CODEX', variant: 'filled', color: 'brand' },
			{ id: 'codebase', label: 'CODEBASE', variant: 'filled' }
		],
		edges: [
			{ from: 'app', to: 'vector' },
			{ from: 'vector', to: 'logs' },
			{ from: 'vector', to: 'metrics' },
			{ from: 'vector', to: 'traces' },
			{ from: 'logs', to: 'logql' },
			{ from: 'metrics', to: 'promql' },
			{ from: 'traces', to: 'traceql' },
			{ from: 'logql', to: 'codex' },
			{ from: 'codex', to: 'codebase' }
		],
		clusters: [
			{
				id: 'obs',
				label: 'Observability stack services',
				nodes: ['logs', 'metrics', 'traces', 'logql', 'promql', 'traceql']
			}
		]
	};
</script>

<Diagram {config} />
