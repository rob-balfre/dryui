import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTimeElement> {
	date: Date | string | number;
	locale?: string;
	updateInterval?: number;
}
declare const RelativeTime: import('svelte').Component<Props, {}, ''>;
type RelativeTime = ReturnType<typeof RelativeTime>;
export default RelativeTime;
