import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const HeroSubheading: import('svelte').Component<Props, {}, ''>;
type HeroSubheading = ReturnType<typeof HeroSubheading>;
export default HeroSubheading;
