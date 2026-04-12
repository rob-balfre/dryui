import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLButtonElement> {
	rowId: string;
	children?: Snippet;
}
declare const DataGridExpandTrigger: import('svelte').Component<Props, {}, ''>;
type DataGridExpandTrigger = ReturnType<typeof DataGridExpandTrigger>;
export default DataGridExpandTrigger;
