import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import Alert from './alert.svelte';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
	variant?: AlertVariant;
	dismissible?: boolean;
	onDismiss?: () => void;
	icon?: Snippet;
	title?: Snippet;
	description?: Snippet;
	children?: Snippet;
}

export { Alert };
export default Alert;
