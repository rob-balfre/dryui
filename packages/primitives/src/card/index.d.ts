import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface CardRootProps extends HTMLAttributes<HTMLElement> {
    as?: 'div' | 'a' | 'button';
    selected?: boolean;
    orientation?: 'vertical' | 'horizontal';
    children: Snippet;
}
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
import CardRoot from './card-root.svelte';
import CardHeader from './card-header.svelte';
import CardContent from './card-content.svelte';
import CardFooter from './card-footer.svelte';
export declare const Card: {
    Root: typeof CardRoot;
    Header: typeof CardHeader;
    Content: typeof CardContent;
    Footer: typeof CardFooter;
};
