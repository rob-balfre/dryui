import type { Snippet } from 'svelte';
interface Props {
	target?: string | HTMLElement | undefined;
	disabled?: boolean | undefined;
	children: Snippet;
}
declare const Portal: import('svelte').Component<Props, {}, ''>;
type Portal = ReturnType<typeof Portal>;
export default Portal;
