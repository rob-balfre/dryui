import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const TabsList: import('svelte').Component<Props, {}, ''>;
type TabsList = ReturnType<typeof TabsList>;
export default TabsList;
