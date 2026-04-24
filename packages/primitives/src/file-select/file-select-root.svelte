<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setFileSelectCtx } from './context.svelte.js';

	interface Props {
		value?: string | null;
		accept?: string | undefined;
		directory?: boolean | undefined;
		onrequest?: (() => Promise<string | null>) | undefined;
		onchange?: ((value: string | null) => void) | undefined;
		disabled?: boolean | undefined;
		children: Snippet;
	}

	let {
		value = $bindable(null),
		accept = '',
		directory = true,
		onrequest,
		onchange,
		disabled = false,
		children
	}: Props = $props();

	let loading = $state(false);
	let fallbackInputEl: HTMLInputElement | null = null;

	function commitValue(nextValue: string | null) {
		if (nextValue === null) return;

		value = nextValue;
		onchange?.(nextValue);
	}

	function getFallbackInputValue(files: FileList | null): string | null {
		const file = files?.[0];
		if (!file) return null;

		const directoryName = file.webkitRelativePath.split('/').find(Boolean);
		return directory && directoryName ? directoryName : file.name;
	}

	function openFallbackInput() {
		if (!fallbackInputEl) return;

		fallbackInputEl.value = '';
		fallbackInputEl.click();
	}

	function attachFallbackInput(node: HTMLInputElement) {
		fallbackInputEl = node;
		return () => {
			if (fallbackInputEl === node) {
				fallbackInputEl = null;
			}
		};
	}

	async function defaultRequest(): Promise<string | null> {
		if (typeof window === 'undefined') return null;
		if (directory && 'showDirectoryPicker' in window) {
			try {
				const handle = await (
					window as unknown as {
						showDirectoryPicker: (opts: { mode: string }) => Promise<{ name: string }>;
					}
				).showDirectoryPicker({ mode: 'read' });
				return handle.name;
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return null;
			}
		}

		openFallbackInput();
		return null;
	}

	async function request() {
		if (disabled || loading) return;
		loading = true;
		try {
			const pick = onrequest ?? defaultRequest;
			const result = await pick();
			commitValue(result);
		} finally {
			loading = false;
		}
	}

	function handleFallbackInputChange(event: Event & { currentTarget: HTMLInputElement }) {
		commitValue(getFallbackInputValue(event.currentTarget.files));
		event.currentTarget.value = '';
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

<input
	{@attach attachFallbackInput}
	type="file"
	{accept}
	webkitdirectory={directory}
	disabled={disabled || undefined}
	aria-hidden="true"
	tabindex="-1"
	class="file-select-hidden-input"
	onchange={handleFallbackInputChange}
/>

{@render children()}

<style>
	.file-select-hidden-input {
		display: none;
		position: absolute;
		height: 0;
		overflow: hidden;
	}
</style>
