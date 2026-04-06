import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: number | undefined;
	max?: number;
	size?: number;
	strokeWidth?: number;
}
declare const ProgressRing: import('svelte').Component<Props, {}, ''>;
type ProgressRing = ReturnType<typeof ProgressRing>;
export default ProgressRing;
