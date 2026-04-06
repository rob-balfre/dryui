import type { GeoJsonData } from '@dryui/primitives';
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
