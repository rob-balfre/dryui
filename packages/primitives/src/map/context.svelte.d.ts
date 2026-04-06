import type { LngLat, MapInstance, MapLibrary, MapMarkerInstance } from './types.js';
export interface MapContext {
	readonly map: MapInstance | null;
	readonly lib: MapLibrary | null;
	readonly container: HTMLDivElement | null;
	readonly loaded: boolean;
	addMarker: (id: string, position: LngLat, element?: HTMLElement) => void;
	removeMarker: (id: string) => void;
	flyTo: (center: LngLat, zoom?: number) => void;
}
export declare function setMapCtx(ctx: MapContext): MapContext;
export declare function getMapCtx(): MapContext;
export interface MarkerContext {
	readonly marker: MapMarkerInstance | null;
	readonly position: LngLat;
}
export declare function setMarkerCtx(ctx: MarkerContext): MarkerContext;
export declare function getMarkerCtx(): MarkerContext;
