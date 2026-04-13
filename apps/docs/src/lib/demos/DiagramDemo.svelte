<script lang="ts">
	import { Diagram } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';
	import {
		Smartphone,
		Radio,
		ScrollText,
		LineChart,
		Activity,
		Search,
		Database,
		Gauge,
		Sparkles,
		GitBranch
	} from 'lucide-svelte';

	const config: DiagramConfig = {
		direction: 'LR',
		spacing: { cornerRadius: 10 },
		nodes: [
			{
				id: 'app',
				label: 'App',
				description: 'Your service',
				iconComponent: Smartphone,
				variant: 'filled'
			},
			{
				id: 'vector',
				label: 'Vector',
				description: 'Pipeline router',
				iconComponent: Radio,
				variant: 'filled'
			},
			{ id: 'logs', label: 'Victoria Logs', description: 'Log storage', iconComponent: ScrollText },
			{
				id: 'metrics',
				label: 'Victoria Metrics',
				description: 'Time-series store',
				iconComponent: LineChart
			},
			{
				id: 'traces',
				label: 'Victoria Traces',
				description: 'Span storage',
				iconComponent: Activity
			},
			{ id: 'logql', label: 'LogQL API', description: 'Query logs', iconComponent: Search },
			{ id: 'promql', label: 'PromQL API', description: 'Query metrics', iconComponent: Gauge },
			{ id: 'traceql', label: 'TraceQL API', description: 'Query spans', iconComponent: Database },
			{
				id: 'codex',
				label: 'Codex',
				description: 'AI agent',
				iconComponent: Sparkles,
				variant: 'filled',
				color: 'brand'
			},
			{
				id: 'codebase',
				label: 'Codebase',
				description: 'Your repo',
				iconComponent: GitBranch,
				variant: 'filled'
			}
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
				label: 'Observability stack',
				iconComponent: Activity,
				color: 'brand',
				nodes: ['logs', 'metrics', 'traces', 'logql', 'promql', 'traceql']
			}
		]
	};
</script>

<Diagram {config} />
