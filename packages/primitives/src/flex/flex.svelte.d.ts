import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const Flex: import('svelte').Component<Props, {}, ''>;
type Flex = ReturnType<typeof Flex>;
export default Flex;
