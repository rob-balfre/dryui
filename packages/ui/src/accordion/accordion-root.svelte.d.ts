import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	type?: 'single' | 'multiple';
	value?: string[];
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const AccordionRoot: import('svelte').Component<Props, {}, 'value'>;
type AccordionRoot = ReturnType<typeof AccordionRoot>;
export default AccordionRoot;
