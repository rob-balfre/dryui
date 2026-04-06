import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
}
declare const Separator: import('svelte').Component<Props, {}, ''>;
type Separator = ReturnType<typeof Separator>;
export default Separator;
