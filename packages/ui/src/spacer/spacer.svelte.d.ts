import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	axis?: 'vertical' | 'horizontal';
}
declare const Spacer: import('svelte').Component<Props, {}, ''>;
type Spacer = ReturnType<typeof Spacer>;
export default Spacer;
