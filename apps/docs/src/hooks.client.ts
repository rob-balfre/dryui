import mapboxgl from 'mapbox-gl';
import mapboxWorkerUrl from 'mapbox-gl/dist/mapbox-gl-csp-worker?url';
import { env } from '$env/dynamic/public';

declare global {
	interface Window {
		mapboxgl?: typeof import('mapbox-gl/dist/mapbox-gl');
	}
}

// Use separate CSP worker to avoid import.meta errors in blob workers
mapboxgl.workerUrl = mapboxWorkerUrl;

const mapboxToken = env.PUBLIC_MAPBOX_TOKEN;

// Only expose mapbox globally when a token is configured. Without a token the
// Map demo renders a placeholder instead of attempting to call the API. See
// apps/docs/.env.example and CONTRIBUTING.md for details.
if (mapboxToken) {
	mapboxgl.accessToken = mapboxToken;
	window.mapboxgl = mapboxgl as unknown as typeof import('mapbox-gl/dist/mapbox-gl');
}
