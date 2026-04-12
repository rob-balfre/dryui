import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const AccordionTrigger: import('svelte').Component<Props, {}, ''>;
type AccordionTrigger = ReturnType<typeof AccordionTrigger>;
export default AccordionTrigger;
