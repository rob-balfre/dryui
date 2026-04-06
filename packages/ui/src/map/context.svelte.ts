import { createContext } from '@dryui/primitives';
import type { LngLat, MapInstance, MapLibrary, MapMarkerInstance } from '@dryui/primitives';

export interface MapContext {
	readonly map: MapInstance | null;
	readonly lib: MapLibrary | null;
	readonly container: HTMLDivElement | null;
	readonly loaded: boolean;
	addMarker: (id: string, position: LngLat, element?: HTMLElement) => void;
	removeMarker: (id: string) => void;
	flyTo: (center: LngLat, zoom?: number) => void;
}
export const [setMapCtx, getMapCtx] = createContext<MapContext>('map');

export interface MarkerContext {
	readonly marker: MapMarkerInstance | null;
	readonly position: LngLat;
}
export const [setMarkerCtx, getMarkerCtx] = createContext<MarkerContext>('map-marker');
