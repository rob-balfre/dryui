import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	variant?: 'default' | 'display';
	children: Snippet;
}
declare const Heading: import('svelte').Component<Props, {}, ''>;
type Heading = ReturnType<typeof Heading>;
export default Heading;
