import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string[];
	maxTags?: number;
	allowDuplicates?: boolean;
	disabled?: boolean;
	size?: 'sm' | 'md' | 'lg';
	onValueChange?: (value: string[]) => void;
	children: Snippet;
}
declare const TagsInputRoot: import('svelte').Component<Props, {}, 'value'>;
type TagsInputRoot = ReturnType<typeof TagsInputRoot>;
export default TagsInputRoot;
