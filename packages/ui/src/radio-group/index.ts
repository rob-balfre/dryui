export type { RadioGroupRootProps, RadioGroupItemProps } from '@dryui/primitives';

import RadioGroupRoot from './radio-group.svelte';
import RadioGroupItem from './radio-group-item.svelte';

export const RadioGroup: {
	Root: typeof RadioGroupRoot;
	Item: typeof RadioGroupItem;
} = {
	Root: RadioGroupRoot,
	Item: RadioGroupItem
};
