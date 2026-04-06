import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	fullWidth?: boolean;
	children: Snippet;
}
declare const MegaMenuPanel: import('svelte').Component<Props, {}, ''>;
type MegaMenuPanel = ReturnType<typeof MegaMenuPanel>;
export default MegaMenuPanel;
