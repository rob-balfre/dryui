import type { Snippet } from 'svelte';
interface Props {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	color?: 'primary' | 'muted' | 'current';
	label?: string;
	class?: string;
	children: Snippet;
}
declare const Icon: import('svelte').Component<Props, {}, ''>;
type Icon = ReturnType<typeof Icon>;
export default Icon;
