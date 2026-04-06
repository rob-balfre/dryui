import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	placeholder?: string;
}
declare const CommandPaletteInput: import('svelte').Component<Props, {}, ''>;
type CommandPaletteInput = ReturnType<typeof CommandPaletteInput>;
export default CommandPaletteInput;
