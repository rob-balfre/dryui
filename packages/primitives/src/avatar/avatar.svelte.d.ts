import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	src?: string;
	alt?: string;
	fallback?: string;
	status?: 'online' | 'offline' | 'busy' | 'away';
	badge?: Snippet;
	children?: Snippet | undefined;
}
declare const Avatar: import('svelte').Component<Props, {}, ''>;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
