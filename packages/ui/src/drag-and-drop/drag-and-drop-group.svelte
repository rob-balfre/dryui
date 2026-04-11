<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setGroupCtx } from './group-context.svelte.js';

	interface Props {
		onMove: (fromListId: string, fromIndex: number, toListId: string, toIndex: number) => void;
		children: Snippet;
	}

	let { onMove, children }: Props = $props();

	const roots = new Map<string, HTMLElement>();
	let activeTarget: { listId: string; index: number } | null = $state(null);

	setGroupCtx({
		register(listId, element) {
			roots.set(listId, element);
		},
		unregister(listId) {
			roots.delete(listId);
		},
		getRoots() {
			return roots;
		},
		get activeTarget() {
			return activeTarget;
		},
		setActiveTarget(listId, index) {
			activeTarget = listId !== null && index !== null ? { listId, index } : null;
		},
		move(fromListId, fromIndex, toListId, toIndex) {
			onMove(fromListId, fromIndex, toListId, toIndex);
		}
	});
</script>

{@render children()}
