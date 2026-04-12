import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TransferItem } from '@dryui/primitives';
interface Props extends HTMLAttributes<HTMLDivElement> {
	type: 'source' | 'target';
	title?: string;
	filterable?: boolean;
	content?: Snippet<
		[
			{
				items: TransferItem[];
			}
		]
	>;
}
declare const TransferList: import('svelte').Component<Props, {}, ''>;
type TransferList = ReturnType<typeof TransferList>;
export default TransferList;
