import type { TagsInputRootProps as PrimitiveTagsInputRootProps } from '@dryui/primitives';
export type { TagsInputInputProps, TagsInputTagProps, TagsInputTagDeleteProps, TagsInputListProps } from '@dryui/primitives';
export interface TagsInputRootProps extends PrimitiveTagsInputRootProps {
    size?: 'sm' | 'md' | 'lg';
}
import Root from './tags-input-root.svelte';
import Input from './tags-input-input.svelte';
import TagItem from './tags-input-tag.svelte';
import TagDelete from './tags-input-tag-delete-button.svelte';
import List from './tags-input-list.svelte';
export declare const TagsInput: {
    Root: typeof Root;
    Input: typeof Input;
    Tag: typeof TagItem;
    TagDelete: typeof TagDelete;
    List: typeof List;
};
