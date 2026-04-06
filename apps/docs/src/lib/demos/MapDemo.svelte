<script lang="ts">
	import { Map } from '@dryui/ui';
</script>

<Map.Root center={[151.21, -33.87]} zoom={12}>
	<Map.Marker position={[151.21, -33.87]}>
		<Map.Popup>Sydney Opera House</Map.Popup>
	</Map.Marker>
	<Map.Marker position={[151.19, -33.86]}>
		<Map.Popup>Harbour Bridge</Map.Popup>
	</Map.Marker>
</Map.Root>
