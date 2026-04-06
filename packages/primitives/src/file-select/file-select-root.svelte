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

{@render children()}
