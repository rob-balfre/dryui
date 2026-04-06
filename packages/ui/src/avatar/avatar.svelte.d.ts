import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	src?: string;
	alt?: string;
	fallback?: string;
	size?: 'sm' | 'md' | 'lg';
	shape?: 'circle' | 'square';
	status?: 'online' | 'offline' | 'busy' | 'away';
	badge?: Snippet;
	children?: Snippet;
}
declare const Avatar: import('svelte').Component<Props, {}, ''>;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
