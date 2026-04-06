import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	padding?: boolean;
	children: Snippet;
}
declare const Container: import('svelte').Component<Props, {}, ''>;
type Container = ReturnType<typeof Container>;
export default Container;
