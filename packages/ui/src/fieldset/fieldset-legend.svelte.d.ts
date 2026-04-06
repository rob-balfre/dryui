import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLegendElement> {
	children: Snippet;
}
declare const FieldsetLegend: import('svelte').Component<Props, {}, ''>;
type FieldsetLegend = ReturnType<typeof FieldsetLegend>;
export default FieldsetLegend;
