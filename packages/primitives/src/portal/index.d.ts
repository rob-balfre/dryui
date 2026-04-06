import type { Snippet } from 'svelte';
export interface PortalProps {
    target?: string | HTMLElement | undefined;
    disabled?: boolean | undefined;
    children: Snippet;
}
export { default as Portal } from './portal.svelte';
