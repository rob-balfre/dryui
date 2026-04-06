import type { TabsTriggerProps as PrimitiveTabsTriggerProps } from '@dryui/primitives';
export type { TabsRootProps, TabsListProps, TabsContentProps } from '@dryui/primitives';
export interface TabsTriggerProps extends PrimitiveTabsTriggerProps {
	size?: 'sm' | 'md' | 'lg';
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
