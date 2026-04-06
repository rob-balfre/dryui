import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type PinInputCell as PinInputCellType } from './context.svelte.js';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	cell: PinInputCellType;
	children?: Snippet<
		[
			{
				char: string | null;
				isActive: boolean;
				hasFakeCaret: boolean;
			}
		]
	>;
}
declare const PinInputCellComponent: import('svelte').Component<Props, {}, ''>;
type PinInputCellComponent = ReturnType<typeof PinInputCellComponent>;
export default PinInputCellComponent;
