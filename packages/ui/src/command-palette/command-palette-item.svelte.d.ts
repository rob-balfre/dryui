import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	onSelect?: () => void;
	children: Snippet;
}
declare const CommandPaletteItem: import('svelte').Component<Props, {}, ''>;
type CommandPaletteItem = ReturnType<typeof CommandPaletteItem>;
export default CommandPaletteItem;
