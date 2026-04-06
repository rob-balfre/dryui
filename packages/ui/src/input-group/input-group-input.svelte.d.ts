import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	value?: string;
}
declare const InputGroupInput: import('svelte').Component<Props, {}, 'value'>;
type InputGroupInput = ReturnType<typeof InputGroupInput>;
export default InputGroupInput;
