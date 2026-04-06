import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type PinInputCell } from '@dryui/primitives';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	value?: string;
	length?: number;
	mask?: boolean;
	type?: 'numeric' | 'alphanumeric';
	pattern?: RegExp;
	placeholder?: string;
	disabled?: boolean;
	oncomplete?: (value: string) => void;
	pasteTransformer?: (text: string) => string;
	blurOnComplete?: boolean;
	name?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'outline' | 'flushed';
	children?: Snippet<
		[
			{
				cells: PinInputCell[];
			}
		]
	>;
}
declare const PinInputRoot: import('svelte').Component<Props, {}, 'value'>;
type PinInputRoot = ReturnType<typeof PinInputRoot>;
export default PinInputRoot;
