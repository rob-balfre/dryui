import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	children: Snippet;
}
declare const TabsContent: import('svelte').Component<Props, {}, ''>;
type TabsContent = ReturnType<typeof TabsContent>;
export default TabsContent;
