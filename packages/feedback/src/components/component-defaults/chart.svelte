<script lang="ts">
	import { Chart } from '@dryui/ui';

	const data = [
		{ label: 'Jan', value: 42 },
		{ label: 'Feb', value: 58 },
		{ label: 'Mar', value: 36 },
		{ label: 'Apr', value: 74 },
		{ label: 'May', value: 51 },
		{ label: 'Jun', value: 88 }
	];
</script>

<Chart.Root {data} width={320} height={180}>
	<Chart.YAxis />
	<Chart.XAxis />
	<Chart.Bars />
</Chart.Root>
