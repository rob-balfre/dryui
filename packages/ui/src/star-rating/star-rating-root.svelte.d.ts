import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	stars: number;
	label?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'filled' | 'outlined';
}
declare const StarRatingRoot: import('svelte').Component<Props, {}, ''>;
type StarRatingRoot = ReturnType<typeof StarRatingRoot>;
export default StarRatingRoot;
