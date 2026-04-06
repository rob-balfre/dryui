import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLHeadingElement> {
	children: Snippet;
}
declare const HeroHeading: import('svelte').Component<Props, {}, ''>;
type HeroHeading = ReturnType<typeof HeroHeading>;
export default HeroHeading;
