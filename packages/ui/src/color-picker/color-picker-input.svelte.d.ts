import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
	format?: 'hex' | 'rgb' | 'hsl';
}
declare const ColorPickerInput: import('svelte').Component<Props, {}, ''>;
type ColorPickerInput = ReturnType<typeof ColorPickerInput>;
export default ColorPickerInput;
