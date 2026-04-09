import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface LogoCloudRootProps extends HTMLAttributes<HTMLDivElement> {
	columns?: number;
	gap?: string;
	align?: 'start' | 'center' | 'end';
	children: Snippet;
}
export interface LogoCloudItemProps extends HTMLAttributes<HTMLElement> {
	href?: string;
	name?: string;
	children: Snippet;
}
import LogoCloudRoot from './logo-cloud-root.svelte';
import LogoCloudItem from './logo-cloud-item.svelte';
export declare const LogoCloud: {
	Root: typeof LogoCloudRoot;
	Item: typeof LogoCloudItem;
};
