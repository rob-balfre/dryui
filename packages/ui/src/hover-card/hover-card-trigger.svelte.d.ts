import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLAnchorElement> {
	href?: string;
	children: Snippet;
}

declare const HoverCardTrigger: import('svelte').Component<Props, {}, ''>;
type HoverCardTrigger = ReturnType<typeof HoverCardTrigger>;
export default HoverCardTrigger;
