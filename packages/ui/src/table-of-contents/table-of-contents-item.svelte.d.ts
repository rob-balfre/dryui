import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TocHeading } from '@dryui/primitives';
type ItemSnippetProps = {
	heading: TocHeading;
	active: boolean;
};
interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
	heading: TocHeading;
	children?: Snippet<[ItemSnippetProps]>;
}
declare const TableOfContentsItem: import('svelte').Component<Props, {}, ''>;
type TableOfContentsItem = ReturnType<typeof TableOfContentsItem>;
export default TableOfContentsItem;
