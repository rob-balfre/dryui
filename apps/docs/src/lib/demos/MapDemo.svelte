<script lang="ts">
	import { Map } from '@dryui/ui';
	import { env } from '$env/dynamic/public';

	const token = env.PUBLIC_MAPBOX_TOKEN;
	let ready = $state(false);

	$effect(() => {
		if (!token) return;
		let cancelled = false;
		(async () => {
			const [mapboxModule, workerModule] = await Promise.all([
				import('mapbox-gl'),
				import('mapbox-gl/dist/mapbox-gl-csp-worker?url')
			]);
			const mapboxgl = mapboxModule.default;
			mapboxgl.workerUrl = workerModule.default;
			mapboxgl.accessToken = token;
			(window as unknown as { mapboxgl?: unknown }).mapboxgl = mapboxgl;
			if (!cancelled) ready = true;
		})();
		return () => {
			cancelled = true;
		};
	});
</script>

{#if token && ready}
	<Map.Root center={[151.21, -33.87]} zoom={12} mapStyle="mapbox://styles/mapbox/dark-v11">
		<Map.Marker position={[151.21, -33.87]}>
			<Map.Popup>Sydney Opera House</Map.Popup>
		</Map.Marker>
		<Map.Marker position={[151.19, -33.86]}>
			<Map.Popup>Harbour Bridge</Map.Popup>
		</Map.Marker>
	</Map.Root>
{:else if !token}
	<p>Set <code>PUBLIC_MAPBOX_TOKEN</code> in <code>apps/docs/.env</code> to load the live map.</p>
{/if}
