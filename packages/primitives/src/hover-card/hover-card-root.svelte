<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setHoverCardCtx } from './context.svelte.js';

	interface Props {
		openDelay?: number;
		closeDelay?: number;
		children: Snippet;
	}

	let { openDelay = 700, closeDelay = 300, children }: Props = $props();

	let open = $state(false);

	const uid = $props.id();
	const triggerId = `hovercard-trigger-${uid}`;
	const contentId = `hovercard-content-${uid}`;

	let openTimeout: ReturnType<typeof setTimeout>;
	let closeTimeout: ReturnType<typeof setTimeout>;

	function clearTimers() {
		clearTimeout(openTimeout);
		clearTimeout(closeTimeout);
	}

	const ctx = {
		get open() {
			return open;
		},
		get triggerId() {
			return triggerId;
		},
		get contentId() {
			return contentId;
		},
		triggerEl: null as HTMLElement | null,
		contentEl: null as HTMLElement | null,
		triggerHovered: false,
		contentHovered: false,
		triggerFocused: false,
		contentFocused: false,
		ignoreNextTriggerFocusOpen: false,
		show,
		showImmediate,
		close,
		forceClose
	};

	function hasActiveInteraction() {
		return ctx.triggerHovered || ctx.contentHovered || ctx.triggerFocused || ctx.contentFocused;
	}

	function show() {
		clearTimeout(closeTimeout);
		if (open) return;
		openTimeout = setTimeout(() => {
			if (!open) open = true;
		}, openDelay);
	}

	function showImmediate() {
		clearTimers();
		if (!open) open = true;
	}

	function close() {
		clearTimeout(openTimeout);
		closeTimeout = setTimeout(() => {
			if (!hasActiveInteraction() && open) {
				open = false;
			}
		}, closeDelay);
	}

	function forceClose() {
		clearTimers();
		ctx.triggerHovered = false;
		ctx.contentHovered = false;
		ctx.triggerFocused = false;
		ctx.contentFocused = false;
		ctx.ignoreNextTriggerFocusOpen = true;
		if (open) open = false;
	}

	setHoverCardCtx(ctx);

	$effect(() => {
		return () => {
			clearTimers();
		};
	});
</script>

{@render children()}
