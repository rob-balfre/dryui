import { createId } from '../utils/create-id.js';

export interface ToastData {
	id: string;
	variant: 'info' | 'success' | 'warning' | 'error';
	title?: string;
	description?: string;
	duration: number;
	persistent?: boolean;
}

type ToastOptions = Partial<Omit<ToastData, 'id' | 'variant'>>;

function createToastStore() {
	let toasts = $state<ToastData[]>([]);

	function add(toast: Omit<ToastData, 'id'>): string {
		const id = createId('toast');
		const persistent = toast.persistent ?? false;
		const duration = persistent ? Infinity : toast.duration;
		toasts = [...toasts, { ...toast, id, duration, persistent }];

		if (duration !== Infinity) {
			setTimeout(() => remove(id), duration || 5000);
		}

		return id;
	}

	function remove(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	return {
		get toasts() {
			return toasts;
		},
		add,
		remove,
		info(title: string, opts?: ToastOptions) {
			return add({ variant: 'info', title, duration: 5000, ...opts });
		},
		success(title: string, opts?: ToastOptions) {
			return add({ variant: 'success', title, duration: 5000, ...opts });
		},
		warning(title: string, opts?: ToastOptions) {
			return add({ variant: 'warning', title, duration: 8000, ...opts });
		},
		error(title: string, opts?: ToastOptions) {
			return add({ variant: 'error', title, duration: Infinity, ...opts });
		}
	};
}

export { createToastStore };

export const toastStore = createToastStore();
