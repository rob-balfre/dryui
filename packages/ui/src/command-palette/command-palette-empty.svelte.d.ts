import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CommandPaletteEmpty: import('svelte').Component<Props, {}, ''>;
type CommandPaletteEmpty = ReturnType<typeof CommandPaletteEmpty>;
export default CommandPaletteEmpty;
