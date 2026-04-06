import type { Snippet } from 'svelte';
interface Props {
	name?: string;
	size?: 'sm' | 'md' | 'lg' | number;
	class?: string;
	children?: Snippet;
}
declare const Root: import('svelte').Component<Props, {}, ''>;
type Root = ReturnType<typeof Root>;
export default Root;
