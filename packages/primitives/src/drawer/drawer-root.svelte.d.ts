import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	side?: 'top' | 'right' | 'bottom' | 'left';
	children: Snippet;
}
declare const DrawerRoot: import('svelte').Component<Props, {}, 'open'>;
type DrawerRoot = ReturnType<typeof DrawerRoot>;
export default DrawerRoot;
