import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	variant?: 'text' | 'circular' | 'rectangular';
	width?: string;
	height?: string;
}
declare const Skeleton: import('svelte').Component<Props, {}, ''>;
type Skeleton = ReturnType<typeof Skeleton>;
export default Skeleton;
