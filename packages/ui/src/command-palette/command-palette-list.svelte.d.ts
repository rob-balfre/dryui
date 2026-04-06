import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CommandPaletteList: import('svelte').Component<Props, {}, ''>;
type CommandPaletteList = ReturnType<typeof CommandPaletteList>;
export default CommandPaletteList;
