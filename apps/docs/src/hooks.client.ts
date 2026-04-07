import mapboxgl from 'mapbox-gl';
import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';

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
