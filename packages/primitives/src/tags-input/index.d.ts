import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface TagsInputRootProps extends HTMLAttributes<HTMLDivElement> {
	value?: string[];
	maxTags?: number;
	allowDuplicates?: boolean;
	disabled?: boolean;
	onValueChange?: (value: string[]) => void;
	children: Snippet;
}
export interface TagsInputInputProps extends HTMLInputAttributes {
	placeholder?: string;
}
export interface TagsInputTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	index: number;
	value: string;
	children?: Snippet | undefined;
}
export interface TagsInputTagDeleteProps extends HTMLButtonAttributes {
	index: number;
	value?: string | undefined;
}
export interface TagsInputListProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
import Root from './tags-input-root.svelte';
import Input from './tags-input-input.svelte';
import TagItem from './tags-input-tag.svelte';
import TagDelete from './tags-input-tag-delete.svelte';
import List from './tags-input-list.svelte';
export declare const TagsInput: {
	Root: typeof Root;
	Input: typeof Input;
	Tag: typeof TagItem;
	TagDelete: typeof TagDelete;
	List: typeof List;
};
