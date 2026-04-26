<script lang="ts">
	import { Diagram } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';

	const config: DiagramConfig = {
		nodes: [
			{ id: 'a', label: 'Brief' },
			{ id: 'b', label: 'Build' },
			{ id: 'c', label: 'Ship' }
		],
		edges: [
			{ from: 'a', to: 'b', arrow: 'end' },
			{ from: 'b', to: 'c', arrow: 'end' }
		]
	};
</script>

<Diagram {config} width={280} height={120} />
