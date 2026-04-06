import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { AlertVariant } from '@dryui/primitives';
interface Props extends HTMLAttributes<HTMLDivElement> {
	variant?: AlertVariant;
	dismissible?: boolean;
	onDismiss?: () => void;
	children: Snippet;
}
declare const AlertRoot: import('svelte').Component<Props, {}, ''>;
type AlertRoot = ReturnType<typeof AlertRoot>;
export default AlertRoot;
