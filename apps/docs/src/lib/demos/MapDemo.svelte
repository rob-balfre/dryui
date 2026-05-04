<script lang="ts">
	import { Link, Map, Text } from '@dryui/ui';
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
	<Map.Root center={[151.21, -33.87]} zoom={12}>
		<Map.Marker position={[151.21, -33.87]}>
			<Map.Popup>Sydney Opera House</Map.Popup>
		</Map.Marker>
		<Map.Marker position={[151.19, -33.86]}>
			<Map.Popup>Harbour Bridge</Map.Popup>
		</Map.Marker>
	</Map.Root>
{:else}
	<div class="map-placeholder" data-map-placeholder>
		<div class="surface">
			<header class="surface-header">
				<Text weight="semibold">
					{token ? 'Loading map…' : 'Map preview unavailable'}
				</Text>
			</header>
			{#if !token}
				<div class="surface-content">
					<Text color="muted" size="sm">
						Set <Text as="span" font="mono" size="sm">PUBLIC_MAPBOX_TOKEN</Text> in
						<Text as="span" font="mono" size="sm">apps/docs/.env</Text> to load the live map. See the
						<Link href="https://github.com/rob-balfre/dryui/blob/main/CONTRIBUTING.md"
							>contributing guide</Link
						> for details.
					</Text>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	[data-map-placeholder] {
		display: grid;
		align-content: center;
		min-height: 400px;
	}

	.surface {
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-card);
		box-shadow: var(--dry-shadow-sm);
		overflow: hidden;
	}

	.surface-header {
		padding: var(--dry-padding-card);
		border-bottom: 1px solid var(--dry-color-stroke-weak);
	}

	.surface-content {
		padding: var(--dry-padding-card);
	}
</style>
