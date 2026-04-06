import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TransferItem } from './context.svelte.js';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	type: 'source' | 'target';
	title?: string | undefined;
	children?:
		| Snippet<
				[
					{
						items: TransferItem[];
					}
				]
		  >
		| undefined;
}
declare const TransferList: import('svelte').Component<Props, {}, ''>;
type TransferList = ReturnType<typeof TransferList>;
export default TransferList;
