import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	src?: string;
	alt?: string;
	fallback?: string;
	size?: 'sm' | 'md' | 'lg';
	shape?: 'square' | 'rounded' | 'circle';
	color?: 'brand' | 'neutral' | 'error' | 'warning' | 'success' | 'info';
}
declare const LogoMark: import('svelte').Component<Props, {}, ''>;
type LogoMark = ReturnType<typeof LogoMark>;
export default LogoMark;
