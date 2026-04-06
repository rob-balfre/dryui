import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}
declare const TabsTrigger: import('svelte').Component<Props, {}, ''>;
type TabsTrigger = ReturnType<typeof TabsTrigger>;
export default TabsTrigger;
