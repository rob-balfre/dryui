import type { ToggleGroupRootProps as PrimitiveToggleGroupRootProps } from '@dryui/primitives';
export type { ToggleGroupItemProps } from '@dryui/primitives';
export interface ToggleGroupRootProps extends PrimitiveToggleGroupRootProps {
    size?: 'sm' | 'md' | 'lg';
}
import ToggleGroupRoot from './toggle-group-root.svelte';
import ToggleGroupItem from './toggle-group-item-button.svelte';
export declare const ToggleGroup: {
    Root: typeof ToggleGroupRoot;
    Item: typeof ToggleGroupItem;
};
