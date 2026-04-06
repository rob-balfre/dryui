import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface UserProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	name: string;
	description?: string;
	children?: Snippet | undefined;
}

export { default as User } from './user.svelte';
