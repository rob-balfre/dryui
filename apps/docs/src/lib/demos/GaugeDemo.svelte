<script>
	import { Gauge } from '@dryui/ui';
</script>

<Gauge
	value={72}
	min={0}
	max={100}
	thresholds={[
		{ value: 30, color: 'red' },
		{ value: 70, color: 'orange' },
		{ value: 90, color: 'green' }
	]}
/>
