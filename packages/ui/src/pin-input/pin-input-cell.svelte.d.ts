import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type PinInputCell } from '@dryui/primitives';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	cell: PinInputCell;
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
