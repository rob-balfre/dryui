import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { AlertVariant } from './context.svelte.js';
export type { AlertVariant };
export interface AlertRootProps extends HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    dismissible?: boolean;
    onDismiss?: () => void;
    children: Snippet;
}
export interface AlertIconProps extends HTMLAttributes<HTMLSpanElement> {
    children: Snippet;
}
export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: Snippet;
}
export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    children: Snippet;
}
export interface AlertCloseProps extends Omit<HTMLButtonAttributes, 'children'> {
    children?: Snippet | undefined;
}
import AlertRoot from './alert-root.svelte';
import AlertIcon from './alert-icon.svelte';
import AlertTitle from './alert-title.svelte';
import AlertDescription from './alert-description.svelte';
import AlertClose from './alert-close.svelte';
export declare const Alert: {
    Root: typeof AlertRoot;
    Icon: typeof AlertIcon;
    Title: typeof AlertTitle;
    Description: typeof AlertDescription;
    Close: typeof AlertClose;
};
