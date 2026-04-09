import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface FocusTrapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	active?: boolean | undefined;
	initialFocus?: string | undefined;
	returnFocus?: boolean | undefined;
	children?: Snippet | undefined;
}
export { default as FocusTrap } from './focus-trap.svelte';
