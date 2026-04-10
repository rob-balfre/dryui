import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
    shape?: 'circle' | 'square';
    status?: 'online' | 'offline' | 'busy' | 'away';
    badge?: Snippet;
    children?: Snippet | undefined;
}
export { default as Avatar } from './avatar.svelte';
