import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AffixGroupInput: import('svelte').Component<Props, {}, ''>;
type AffixGroupInput = ReturnType<typeof AffixGroupInput>;
export default AffixGroupInput;
