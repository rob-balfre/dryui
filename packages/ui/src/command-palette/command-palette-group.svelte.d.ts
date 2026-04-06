import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	heading?: string;
	children: Snippet;
}
declare const CommandPaletteGroup: import('svelte').Component<Props, {}, ''>;
type CommandPaletteGroup = ReturnType<typeof CommandPaletteGroup>;
export default CommandPaletteGroup;
