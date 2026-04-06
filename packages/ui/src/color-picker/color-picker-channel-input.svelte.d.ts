import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max'> {
	channel: 'h' | 's' | 'v';
}
declare const ColorPickerChannelInput: import('svelte').Component<Props, {}, ''>;
type ColorPickerChannelInput = ReturnType<typeof ColorPickerChannelInput>;
export default ColorPickerChannelInput;
