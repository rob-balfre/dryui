import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDialogElement> {
	open?: boolean;
	children: Snippet;
}
declare const CommandPaletteRoot: import('svelte').Component<Props, {}, 'open'>;
type CommandPaletteRoot = ReturnType<typeof CommandPaletteRoot>;
export default CommandPaletteRoot;
