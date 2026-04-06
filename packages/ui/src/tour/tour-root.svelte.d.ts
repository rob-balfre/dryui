import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TourStep } from '@dryui/primitives/tour';
interface Props extends HTMLAttributes<HTMLDivElement> {
	steps: TourStep[];
	active?: boolean;
	onComplete?: () => void;
	onSkip?: () => void;
	children: Snippet;
}
declare const TourRoot: import('svelte').Component<Props, {}, 'active'>;
type TourRoot = ReturnType<typeof TourRoot>;
export default TourRoot;
