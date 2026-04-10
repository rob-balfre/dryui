import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { LngLat, MapInstance, MapOptions, GeoJsonData } from '@dryui/primitives';
export type { LngLat, MapInstance, MapLibrary, MapMarkerInstance, MapPopupInstance, MapOptions, MapControl, MapSource, MarkerOptions, PopupOptions, GeoJsonData } from '@dryui/primitives';
export interface MapRootProps extends HTMLAttributes<HTMLDivElement> {
    center?: LngLat;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    mapStyle?: string;
    createMap?: (container: HTMLDivElement, options: MapOptions) => MapInstance;
    children?: Snippet;
}
export interface MapMarkerProps {
    position: LngLat;
    color?: string;
    children?: Snippet;
    class?: string;
}
export interface MapPopupProps {
    maxWidth?: string;
    closeButton?: boolean;
    closeOnClick?: boolean;
    children: Snippet;
    class?: string;
}
export interface MapLayerProps {
    id: string;
    type: 'heatmap' | 'polygon' | 'fill' | 'circle' | 'line';
    data: GeoJsonData;
    color?: string;
    opacity?: number;
}
export interface MapControlsProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    navigation?: boolean;
    fullscreen?: boolean;
    children?: Snippet;
}
import MapRoot from './map-root.svelte';
import MapMarker from './map-marker.svelte';
import MapPopup from './map-popup.svelte';
import MapLayer from './map-layer.svelte';
import MapControls from './map-controls.svelte';
export declare const Map: {
    Root: typeof MapRoot;
    Marker: typeof MapMarker;
    Popup: typeof MapPopup;
    Layer: typeof MapLayer;
    Controls: typeof MapControls;
};
