<script lang="ts">
	import { Chart } from '@dryui/ui';

	const data = [
		{ label: 'Jan', value: 108 },
		{ label: 'Feb', value: 112 },
		{ label: 'Mar', value: 119 },
		{ label: 'Apr', value: 128 },
		{ label: 'May', value: 134 },
		{ label: 'Jun', value: 142 }
	];
</script>

<Chart.Root {data} width={480} height={180} summary="Sample chart">
	<Chart.Bars radius={4} />
	<Chart.XAxis />
	<Chart.YAxis ticks={4} />
</Chart.Root>
