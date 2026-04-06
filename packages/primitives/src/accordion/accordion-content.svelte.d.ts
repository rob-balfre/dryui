import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AccordionContent: import('svelte').Component<Props, {}, ''>;
type AccordionContent = ReturnType<typeof AccordionContent>;
export default AccordionContent;
