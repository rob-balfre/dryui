import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}
declare const AffixGroupPrefix: import('svelte').Component<Props, {}, ''>;
type AffixGroupPrefix = ReturnType<typeof AffixGroupPrefix>;
export default AffixGroupPrefix;
