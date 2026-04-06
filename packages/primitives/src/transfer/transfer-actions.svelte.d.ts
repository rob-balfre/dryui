import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?:
		| Snippet<
				[
					{
						moveToTarget: () => void;
						moveToSource: () => void;
						moveAllToTarget: () => void;
						moveAllToSource: () => void;
						canMoveToTarget: boolean;
						canMoveToSource: boolean;
					}
				]
		  >
		| undefined;
}
declare const TransferActions: import('svelte').Component<Props, {}, ''>;
type TransferActions = ReturnType<typeof TransferActions>;
export default TransferActions;
