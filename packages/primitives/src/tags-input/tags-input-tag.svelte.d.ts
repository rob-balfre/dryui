import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	index: number;
	value: string;
	children?: Snippet | undefined;
}
declare const TagsInputTag: import('svelte').Component<Props, {}, ''>;
type TagsInputTag = ReturnType<typeof TagsInputTag>;
export default TagsInputTag;
