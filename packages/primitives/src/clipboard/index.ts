import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ClipboardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	value: string;
	timeout?: number;
	children: Snippet<[{ copied: boolean; copy: () => void }]>;
}

export { default as Clipboard } from './clipboard.svelte';
