<script lang="ts">
	import { Chart } from '@dryui/ui';

	const data = [
		{ label: 'Jan', value: 40 },
		{ label: 'Feb', value: 65 },
		{ label: 'Mar', value: 55 },
		{ label: 'Apr', value: 80 },
		{ label: 'May', value: 72 }
	];
</script>

<Chart.Root {data} width={400} height={200}>
	<Chart.Bars />
	<Chart.XAxis />
	<Chart.YAxis />
</Chart.Root>
