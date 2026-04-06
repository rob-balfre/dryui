import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface VirtualListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	items: T[];
	itemHeight: number | ((index: number) => number);
	overscan?: number;
	children: Snippet<[{ item: T; index: number; style: string }]>;
}

export { default as VirtualList } from './virtual-list.svelte';
