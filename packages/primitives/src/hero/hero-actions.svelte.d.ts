import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const HeroActions: import('svelte').Component<Props, {}, ''>;
type HeroActions = ReturnType<typeof HeroActions>;
export default HeroActions;
