import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const AccordionItem: import('svelte').Component<Props, {}, ''>;
type AccordionItem = ReturnType<typeof AccordionItem>;
export default AccordionItem;
