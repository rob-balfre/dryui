import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const HeroRoot: import('svelte').Component<Props, {}, ''>;
type HeroRoot = ReturnType<typeof HeroRoot>;
export default HeroRoot;
