import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	count?: number;
	maxVisible?: number;
	size?: 'sm' | 'md' | 'lg';
	overlap?: 'sm' | 'md' | 'lg';
	status?: 'online' | 'offline' | 'busy' | 'away';
	label?: string;
	children: Snippet;
}
declare const AvatarGroup: import('svelte').Component<Props, {}, ''>;
type AvatarGroup = ReturnType<typeof AvatarGroup>;
export default AvatarGroup;
