import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const TagsInputList: import('svelte').Component<Props, {}, ''>;
type TagsInputList = ReturnType<typeof TagsInputList>;
export default TagsInputList;
