import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    count?: number;
    maxVisible?: number;
    size?: 'sm' | 'md' | 'lg';
    overlap?: 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'busy' | 'away';
    label?: string;
    children: Snippet;
}
export { default as AvatarGroup } from './avatar-group.svelte';
