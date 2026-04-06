import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	orientation?: 'horizontal' | 'vertical';
	activationMode?: 'automatic' | 'manual';
	children: Snippet;
}
declare const TabsRoot: import('svelte').Component<Props, {}, 'value'>;
type TabsRoot = ReturnType<typeof TabsRoot>;
export default TabsRoot;
