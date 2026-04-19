<script lang="ts">
	import { Card, Link, Map, Text } from '@dryui/ui';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	const token = env.PUBLIC_MAPBOX_TOKEN;
	let ready = $state(false);

	onMount(async () => {
		if (!token) return;
		const [mapboxModule, workerModule] = await Promise.all([
			import('mapbox-gl'),
			import('mapbox-gl/dist/mapbox-gl-csp-worker?url')
		]);
		const mapboxgl = mapboxModule.default;
		mapboxgl.workerUrl = workerModule.default;
		mapboxgl.accessToken = token;
		window.mapboxgl = mapboxgl;
		ready = true;
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
		<Card.Root>
			<Card.Header>
				<Text weight="semibold">
					{token ? 'Loading map…' : 'Map preview unavailable'}
				</Text>
			</Card.Header>
			{#if !token}
				<Card.Content>
					<Text color="muted" size="sm">
						Set <Text as="span" font="mono" size="sm">PUBLIC_MAPBOX_TOKEN</Text> in
						<Text as="span" font="mono" size="sm">apps/docs/.env</Text> to load the live map. See the
						<Link href="https://github.com/rob-balfre/dryui/blob/main/CONTRIBUTING.md"
							>contributing guide</Link
						> for details.
					</Text>
				</Card.Content>
			{/if}
		</Card.Root>
	</div>
{/if}

<style>
	[data-map-placeholder] {
		display: grid;
		align-content: center;
		min-height: 400px;
	}
</style>
