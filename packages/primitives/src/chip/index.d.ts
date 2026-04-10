import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface ChipBaseProps {
    selected?: boolean;
    disabled?: boolean;
    href?: string;
    rel?: string;
    target?: string;
    download?: boolean | string;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
}
export type ChipProps = ChipBaseProps & Omit<HTMLButtonAttributes, 'type' | 'disabled' | 'onclick' | 'children'> & Omit<HTMLAnchorAttributes, 'href' | 'rel' | 'target' | 'download' | 'type' | 'onclick' | 'children'>;
export { default as Chip } from './chip.svelte';
