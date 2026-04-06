export interface DismissOptions {
	onDismiss: () => void;
	escapeKey?: boolean;
	clickOutside?: boolean;
	containerEl?: () => HTMLElement | null;
}

export function createDismiss(options: DismissOptions): void {
	const escapeKey = options.escapeKey ?? true;
	const clickOutside = options.clickOutside ?? true;

	$effect(() => {
		if (!escapeKey) return;

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				options.onDismiss();
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (!clickOutside) return;

		function handlePointerdown(e: PointerEvent) {
			const container = options.containerEl?.();
			if (container && e.target instanceof Node && !container.contains(e.target)) {
				options.onDismiss();
			}
		}

		document.addEventListener('pointerdown', handlePointerdown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerdown);
		};
	});
}
