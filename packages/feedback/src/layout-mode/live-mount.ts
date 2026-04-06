/**
 * Manages mounting/unmounting Svelte components into placement wrapper divs.
 *
 * The reconcile/tracking logic is browser-agnostic and testable in bun.
 * The mount/unmount calls are try/caught since svelte's mount() is a browser API
 * that is unavailable in the bun test environment.
 */

interface MountedInstance {
	// The Svelte component instance returned by mount()
	// Typed as unknown to avoid importing svelte types that break in bun
	instance: unknown;
}

export interface ReconcileDiff {
	added: string[];
	removed: string[];
}

export interface MountManager {
	mountComponent(id: string, componentName: string, target: HTMLElement): void;
	unmountComponent(id: string): void;
	unmountAll(): void;
	hasMounted(id: string): boolean;
	markMounted(id: string): void;
	reconcile(currentIds: string[], previousIds: Set<string>): ReconcileDiff;
}

export function createMountManager(): MountManager {
	const mounted = new Map<string, MountedInstance>();

	function mountComponent(id: string, componentName: string, target: HTMLElement): void {
		if (mounted.has(id)) return;

		try {
			// Dynamic import deferred to avoid top-level svelte import breaking bun tests
			const { mount } = require('svelte') as typeof import('svelte');
			const { thumbnailMap } =
				require('@dryui/ui/thumbnail') as typeof import('@dryui/ui/thumbnail');
			const component = thumbnailMap[componentName];
			if (!component) return;
			const instance = mount(component, { target, props: {} });
			mounted.set(id, { instance });
		} catch {
			// Silently fail in environments where svelte mount is unavailable (e.g. bun tests)
		}
	}

	function unmountComponent(id: string): void {
		const entry = mounted.get(id);
		if (!entry) return;

		try {
			const { unmount } = require('svelte') as typeof import('svelte');
			unmount(entry.instance as Parameters<typeof unmount>[0]);
		} catch {
			// Silently fail in environments where svelte unmount is unavailable
		} finally {
			mounted.delete(id);
		}
	}

	function unmountAll(): void {
		for (const id of mounted.keys()) {
			unmountComponent(id);
		}
		mounted.clear();
	}

	function hasMounted(id: string): boolean {
		return mounted.has(id);
	}

	function markMounted(id: string): void {
		if (!mounted.has(id)) {
			mounted.set(id, { instance: null });
		}
	}

	function reconcile(currentIds: string[], previousIds: Set<string>): ReconcileDiff {
		const currentSet = new Set(currentIds);

		const added = currentIds.filter((id) => !previousIds.has(id));
		const removed = [...previousIds].filter((id) => !currentSet.has(id));

		return { added, removed };
	}

	return {
		mountComponent,
		unmountComponent,
		unmountAll,
		hasMounted,
		markMounted,
		reconcile
	};
}
