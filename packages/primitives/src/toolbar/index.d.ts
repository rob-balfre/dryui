import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
export interface ToolbarRootProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
}
export interface ToolbarButtonProps extends HTMLButtonAttributes {
    disabled?: boolean;
    children: Snippet;
}
export interface ToolbarSeparatorProps extends HTMLAttributes<HTMLDivElement> {
}
export interface ToolbarLinkProps extends HTMLAnchorAttributes {
    href: string;
    children: Snippet;
}
import ToolbarRoot from './toolbar-root.svelte';
import ToolbarButton from './toolbar-button.svelte';
import ToolbarSeparator from './toolbar-separator.svelte';
import ToolbarLink from './toolbar-link.svelte';
export declare const Toolbar: {
    Root: typeof ToolbarRoot;
    Button: typeof ToolbarButton;
    Separator: typeof ToolbarSeparator;
    Link: typeof ToolbarLink;
};
