import type { Snippet } from 'svelte';
interface Props {
	position: [number, number];
	color?: string;
	children?: Snippet;
	class?: string;
}
declare const MapMarker: import('svelte').Component<Props, {}, ''>;
type MapMarker = ReturnType<typeof MapMarker>;
export default MapMarker;
