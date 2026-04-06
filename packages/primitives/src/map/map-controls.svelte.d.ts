import type { Snippet } from 'svelte';
interface Props {
	position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	navigation?: boolean;
	fullscreen?: boolean;
	children?: Snippet;
}
declare const MapControls: import('svelte').Component<Props, {}, ''>;
type MapControls = ReturnType<typeof MapControls>;
export default MapControls;
