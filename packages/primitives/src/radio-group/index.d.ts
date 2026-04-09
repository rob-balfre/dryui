import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
export interface RadioGroupRootProps extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
export interface RadioGroupItemProps extends Omit<HTMLInputAttributes, 'children'> {
	value: string;
	disabled?: boolean;
	children?: Snippet | undefined;
}
import RadioGroupRoot from './radio-group.svelte';
import RadioGroupItem from './radio-group-item.svelte';
export declare const RadioGroup: {
	Root: typeof RadioGroupRoot;
	Item: typeof RadioGroupItem;
};
