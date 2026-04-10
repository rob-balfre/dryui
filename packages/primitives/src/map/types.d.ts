/** Coordinate pair [longitude, latitude] */
export type LngLat = [number, number];
/** Position for map controls */
export type ControlPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/** GeoJSON data or URL string accepted by map sources */
export type GeoJsonData = Record<string, unknown> | string;
/** Subset of the maplibre-gl / mapbox-gl Map instance API used by DryUI */
export interface MapInstance {
    on(event: string, callback: () => void): void;
    loaded(): boolean;
    getCenter(): {
        lng: number;
        lat: number;
    };
    setCenter(center: LngLat): void;
    getZoom(): number;
    setZoom(zoom: number): void;
    flyTo(options: {
        center: LngLat;
        zoom?: number;
    }): void;
    addControl(control: MapControl, position?: ControlPosition): void;
    removeControl(control: MapControl): void;
    addSource(id: string, source: {
        type: string;
        data: GeoJsonData;
    }): void;
    getSource(id: string): MapSource | undefined;
    removeSource(id: string): void;
    addLayer(layer: {
        id: string;
        type: string;
        source: string;
        paint: Record<string, unknown>;
    }): void;
    getLayer(id: string): object | undefined;
    removeLayer(id: string): void;
    setPaintProperty(layerId: string, name: string, value: unknown): void;
    remove(): void;
}
/** Subset of the maplibre-gl / mapbox-gl Marker API */
export interface MapMarkerInstance {
    setLngLat(position: LngLat): MapMarkerInstance;
    addTo(map: MapInstance): MapMarkerInstance;
    setPopup(popup: MapPopupInstance): MapMarkerInstance;
    remove(): void;
}
/** Subset of the maplibre-gl / mapbox-gl Popup API */
export interface MapPopupInstance {
    setDOMContent(el: HTMLElement): MapPopupInstance;
    remove(): void;
}
/** Opaque control instance passed to addControl/removeControl */
export interface MapControl {
}
/** Source instance returned by map.getSource() */
export interface MapSource {
    setData(data: GeoJsonData): void;
}
/** Options for creating a map instance */
export interface MapOptions {
    container: HTMLDivElement;
    center: LngLat;
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    style?: string;
}
/** Options for creating a marker */
export interface MarkerOptions {
    element?: HTMLElement;
    color?: string;
}
/** Options for creating a popup */
export interface PopupOptions {
    maxWidth?: string;
    closeButton?: boolean;
    closeOnClick?: boolean;
    className?: string;
}
/** Map library interface (maplibre-gl or mapbox-gl) */
export interface MapLibrary {
    Map: new (options: MapOptions) => MapInstance;
    Marker: new (options?: MarkerOptions) => MapMarkerInstance;
    Popup: new (options?: PopupOptions) => MapPopupInstance;
    NavigationControl?: new () => MapControl;
    FullscreenControl?: new () => MapControl;
}
