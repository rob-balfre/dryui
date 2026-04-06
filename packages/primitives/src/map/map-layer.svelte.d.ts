import type { GeoJsonData } from './types.js';
interface Props {
	id: string;
	type: 'heatmap' | 'polygon' | 'fill' | 'circle' | 'line';
	data: GeoJsonData;
	color?: string;
	opacity?: number;
}
declare const MapLayer: import('svelte').Component<Props, {}, ''>;
type MapLayer = ReturnType<typeof MapLayer>;
export default MapLayer;
