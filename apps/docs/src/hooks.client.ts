import mapboxgl from 'mapbox-gl';
import mapboxWorkerUrl from 'mapbox-gl/dist/mapbox-gl-csp-worker?url';
import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';

// Use separate CSP worker to avoid import.meta errors in blob workers
mapboxgl.workerUrl = mapboxWorkerUrl;

const mapboxToken = PUBLIC_MAPBOX_TOKEN;

if (mapboxToken) {
	mapboxgl.accessToken = mapboxToken;
}

declare global {
	interface Window {
		mapboxgl?: typeof import('mapbox-gl/dist/mapbox-gl');
	}
}

window.mapboxgl = mapboxgl as unknown as typeof import('mapbox-gl/dist/mapbox-gl');
