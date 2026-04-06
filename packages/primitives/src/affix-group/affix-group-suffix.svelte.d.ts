import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AffixGroupSuffix: import('svelte').Component<Props, {}, ''>;
type AffixGroupSuffix = ReturnType<typeof AffixGroupSuffix>;
export default AffixGroupSuffix;
