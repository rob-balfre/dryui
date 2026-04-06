import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { SvelteComponent } from 'svelte';

interface ModalTriggerProps extends HTMLAttributes<HTMLDivElement> {
	ctx: { readonly open: boolean; show: () => void };
	children: Snippet;
}

export default class ModalTrigger extends SvelteComponent<ModalTriggerProps> {}
