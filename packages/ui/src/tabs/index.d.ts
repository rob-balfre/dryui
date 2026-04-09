import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface TabsRootProps extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	orientation?: 'horizontal' | 'vertical';
	activationMode?: 'automatic' | 'manual';
	children: Snippet;
}
export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface TabsTriggerProps extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	children: Snippet;
}
import TabsRoot from './tabs-root.svelte';
import TabsList from './tabs-list.svelte';
import TabsTrigger from './tabs-trigger.svelte';
import TabsContent from './tabs-content.svelte';
export declare const Tabs: {
	Root: typeof TabsRoot;
	List: typeof TabsList;
	Trigger: typeof TabsTrigger;
	Content: typeof TabsContent;
};
