import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'children'> {
	value: string;
	disabled?: boolean;
	children?: Snippet | undefined;
}
declare const RadioGroupItem: import('svelte').Component<Props, {}, ''>;
type RadioGroupItem = ReturnType<typeof RadioGroupItem>;
export default RadioGroupItem;
