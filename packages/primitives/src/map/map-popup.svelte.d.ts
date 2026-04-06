import type { Snippet } from 'svelte';
interface Props {
	maxWidth?: string;
	closeButton?: boolean;
	closeOnClick?: boolean;
	children: Snippet;
	class?: string;
}
declare const MapPopup: import('svelte').Component<Props, {}, ''>;
type MapPopup = ReturnType<typeof MapPopup>;
export default MapPopup;
