import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	index: number;
	value: string;
	children?: Snippet;
}
declare const TagsInputTag: import('svelte').Component<Props, {}, ''>;
type TagsInputTag = ReturnType<typeof TagsInputTag>;
export default TagsInputTag;
