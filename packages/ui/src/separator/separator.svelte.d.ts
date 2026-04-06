import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	variant?: 'weak' | 'strong';
	decorative?: boolean;
}
declare const Separator: import('svelte').Component<Props, {}, ''>;
type Separator = ReturnType<typeof Separator>;
export default Separator;
