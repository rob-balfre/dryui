import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const AffixGroupAction: import('svelte').Component<Props, {}, ''>;
type AffixGroupAction = ReturnType<typeof AffixGroupAction>;
export default AffixGroupAction;
