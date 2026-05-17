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
		<Map.Marker position={[151.21, -33.87]} class="map-demo-marker">
			<span class="map-demo-pin" aria-hidden="true"></span>
			<Map.Popup>Sydney Opera House</Map.Popup>
		</Map.Marker>
		<Map.Marker position={[151.19, -33.86]} class="map-demo-marker">
			<span class="map-demo-pin" aria-hidden="true"></span>
			<Map.Popup>Harbour Bridge</Map.Popup>
		</Map.Marker>
	</Map.Root>
{:else if !token}
	<p>Set <code>PUBLIC_MAPBOX_TOKEN</code> in <code>apps/docs/.env</code> to load the live map.</p>
{/if}

<style>
	:global([data-part='marker-content'].map-demo-marker) {
		background: transparent;
		box-shadow: none;
		padding: 0;
		border-radius: 0;
		display: grid;
		place-items: center;
	}

	.map-demo-pin {
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 50%;
		background: oklch(72% 0.17 50);
		border: 2px solid oklch(8% 0 0);
		box-shadow:
			0 0 0 1px oklch(72% 0.17 50 / 0.45),
			0 0 14px oklch(72% 0.17 50 / 0.55),
			0 2px 6px oklch(0% 0 0 / 0.5);
		transition:
			transform 160ms ease,
			box-shadow 160ms ease;
	}

	:global([data-part='marker-content'].map-demo-marker:hover) .map-demo-pin {
		transform: scale(1.15);
		box-shadow:
			0 0 0 1px oklch(72% 0.17 50 / 0.6),
			0 0 22px oklch(72% 0.17 50 / 0.7),
			0 4px 10px oklch(0% 0 0 / 0.55);
	}
</style>
