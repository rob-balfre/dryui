<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setTooltipCtx } from './context.svelte.js';

	interface Props {
		openDelay?: number;
		closeDelay?: number;
		children: Snippet;
	}

	let { openDelay = 700, closeDelay = 300, children }: Props = $props();

	let open = $state(false);

	const uid = $props.id();
	const triggerId = `tooltip-trigger-${uid}`;
	const contentId = `tooltip-content-${uid}`;

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

	function showImmediate() {
		clearTimeout(closeTimeout);
		clearTimeout(openTimeout);
		open = true;
	}

	function closeImmediate() {
		clearTimeout(closeTimeout);
		clearTimeout(openTimeout);
		open = false;
	}

	$effect(() => {
		return () => {
			clearTimeout(openTimeout);
			clearTimeout(closeTimeout);
		};
	});

	setTooltipCtx({
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
		close,
		showImmediate,
		closeImmediate
	});
</script>

{@render children()}
