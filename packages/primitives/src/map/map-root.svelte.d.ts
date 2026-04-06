import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { LngLat, MapInstance, MapOptions } from './types.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	center?: LngLat;
	zoom?: number;
	minZoom?: number;
	maxZoom?: number;
	mapStyle?: string;
	createMap?: (container: HTMLDivElement, options: MapOptions) => MapInstance;
	children?: Snippet;
}
declare const MapRoot: import('svelte').Component<Props, {}, ''>;
type MapRoot = ReturnType<typeof MapRoot>;
export default MapRoot;
