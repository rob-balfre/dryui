<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setFileSelectCtx } from './context.svelte.js';

	interface Props {
		value?: string | null;
		onrequest?: (() => Promise<string | null>) | undefined;
		onchange?: ((value: string | null) => void) | undefined;
		disabled?: boolean | undefined;
		children: Snippet;
	}

	let {
		value = $bindable(null),
		onrequest,
		onchange,
		disabled = false,
		children
	}: Props = $props();

	let loading = $state(false);

	async function defaultRequest(): Promise<string | null> {
		if (typeof window === 'undefined') return null;
		if (!('showDirectoryPicker' in window)) return null;
		try {
			const handle = await (
				window as unknown as {
					showDirectoryPicker: (opts: { mode: string }) => Promise<{ name: string }>;
				}
			).showDirectoryPicker({ mode: 'read' });
			return handle.name;
		} catch {
			return null;
		}
	}

	async function request() {
		if (disabled || loading) return;
		loading = true;
		try {
			const pick = onrequest ?? defaultRequest;
			const result = await pick();
			if (result !== null) {
				value = result;
				onchange?.(result);
			}
		} finally {
			loading = false;
		}
	}

	function clear() {
		if (disabled) return;
		value = null;
		onchange?.(null);
	}

	setFileSelectCtx({
		get value() {
			return value;
		},
		get loading() {
			return loading;
		},
		get disabled() {
			return disabled;
		},
		request,
		clear
	});
</script>

<div data-file-select data-disabled={disabled || undefined}>
	{@render children()}
</div>

<style>
	[data-file-select] {
		container-type: inline-size;
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		font-family: var(--dry-font-sans);
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-strong);
		border-radius: var(--dry-radius-md);
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-file-select]:focus-within {
		border-color: var(--dry-color-focus-ring);
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
	}

	[data-file-select][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	@container (max-width: 280px) {
		[data-file-select] {
			grid-template-columns: 1fr;
		}
	}
</style>
