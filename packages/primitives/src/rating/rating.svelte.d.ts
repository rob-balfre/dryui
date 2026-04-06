import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: number;
	max?: number;
	disabled?: boolean;
	readonly?: boolean;
	allowHalf?: boolean;
	onValueChange?: (value: number) => void;
}
declare const Rating: import('svelte').Component<Props, {}, 'value'>;
type Rating = ReturnType<typeof Rating>;
export default Rating;
