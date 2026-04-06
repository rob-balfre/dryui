<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setHoverCardCtx } from './context.svelte.js';

	interface Props {
		openDelay?: number;
		closeDelay?: number;
		children: Snippet;
	}

	let { openDelay = 700, closeDelay = 300, children }: Props = $props();

	let open = $state(false);

	const triggerId = generateFormId('hovercard-trigger');
	const contentId = generateFormId('hovercard-content');

	let openTimeout: ReturnType<typeof setTimeout>;
	let closeTimeout: ReturnType<typeof setTimeout>;

	function show() {
		clearTimeout(closeTimeout);
		openTimeout = setTimeout(() => {
			open = true;
		}, openDelay);
	}

	function close() {
		clearTimeout(openTimeout);
		closeTimeout = setTimeout(() => {
			open = false;
		}, closeDelay);
	}

	setHoverCardCtx({
		get open() {
			return open;
		},
		get triggerId() {
			return triggerId;
		},
		get contentId() {
			return contentId;
		},
		triggerEl: null,
		show,
		close
	});

	$effect(() => {
		return () => {
			clearTimeout(openTimeout);
			clearTimeout(closeTimeout);
		};
	});
</script>

{@render children()}
