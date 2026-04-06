import type { Snippet } from 'svelte';

interface Props {
	openDelay?: number;
	closeDelay?: number;
	children: Snippet;
}

declare const HoverCardRoot: import('svelte').Component<Props, {}, ''>;
type HoverCardRoot = ReturnType<typeof HoverCardRoot>;
export default HoverCardRoot;
