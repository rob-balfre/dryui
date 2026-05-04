<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Chart } from '../../../packages/ui/src/chart/index.js';

	const data = [
		{ label: 'Jan', value: 40 },
		{ label: 'Feb', value: 65 },
		{ label: 'Mar', value: 55 },
		{ label: 'Apr', value: 80 },
		{ label: 'May', value: 72 }
	];
</script>

<Chart.Root {data} width={480} height={180}>
	<Chart.Bars />
	<Chart.XAxis />
	<Chart.YAxis />
</Chart.Root>
