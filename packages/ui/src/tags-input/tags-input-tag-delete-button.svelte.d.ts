import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	index: number;
	value?: string;
}
declare const TagsInputTagDelete: import('svelte').Component<Props, {}, ''>;
type TagsInputTagDelete = ReturnType<typeof TagsInputTagDelete>;
export default TagsInputTagDelete;
