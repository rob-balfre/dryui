import type { Component, Snippet } from 'svelte';
import ThumbnailRoot from './root.svelte';
export interface ThumbnailProps {
    name?: string;
    size?: 'sm' | 'md' | 'lg' | number;
    class?: string;
    children?: Snippet;
}
export declare const thumbnailMap: Record<string, Component<any>>;
export declare const Thumbnail: typeof ThumbnailRoot & {
    Root: typeof ThumbnailRoot;
};
