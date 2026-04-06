import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	children?:
		| Snippet<
				[
					{
						page: number;
						totalPages: number;
						totalItems: number;
						pageSize: number;
						canPrevious: boolean;
						canNext: boolean;
						previous: () => void;
						next: () => void;
						goto: (page: number) => void;
					}
				]
		  >
		| undefined;
}
declare const DataGridPagination: import('svelte').Component<Props, {}, ''>;
type DataGridPagination = ReturnType<typeof DataGridPagination>;
export default DataGridPagination;
