<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setFileUploadCtx } from './context.svelte.js';

	interface Props {
		files?: File[];
		accept?: string | undefined;
		multiple?: boolean | undefined;
		maxSize?: number | undefined;
		maxFiles?: number | undefined;
		disabled?: boolean | undefined;
		onFilesChange?: ((files: File[]) => void) | undefined;
		children: Snippet;
	}

	let {
		files = $bindable([]),
		accept = '',
		multiple = false,
		maxSize = 0,
		maxFiles = 0,
		disabled = false,
		onFilesChange,
		children
	}: Props = $props();

	let isDragging = $state(false);
	let inputEl = $state<HTMLInputElement>();

	function isFileAccepted(file: File): boolean {
		if (!accept) return true;
		const types = accept.split(',').map((t) => t.trim());
		return types.some((type) => {
			if (type.startsWith('.')) {
				return file.name.toLowerCase().endsWith(type.toLowerCase());
			}
			if (type.endsWith('/*')) {
				const baseType = type.slice(0, -2);
				return file.type.startsWith(baseType);
			}
			return file.type === type;
		});
	}

	function addFiles(incoming: FileList | File[]) {
		if (disabled) return;
		const arr = Array.from(incoming);
		const valid = arr.filter((f) => {
			if (!isFileAccepted(f)) return false;
			if (maxSize > 0 && f.size > maxSize) return false;
			return true;
		});

		if (multiple) {
			const combined = [...files, ...valid];
			const limited = maxFiles > 0 ? combined.slice(0, maxFiles) : combined;
			files = limited;
		} else {
			files = valid.slice(0, 1);
		}

		onFilesChange?.(files);
	}

	function removeFile(index: number) {
		if (disabled) return;
		files = files.filter((_, i) => i !== index);
		onFilesChange?.(files);
	}

	function clearFiles() {
		if (disabled) return;
		files = [];
		if (inputEl) inputEl.value = '';
		onFilesChange?.(files);
	}

	function openFileDialog() {
		if (disabled) return;
		inputEl?.click();
	}

	function setDragging(value: boolean) {
		isDragging = value;
	}

	setFileUploadCtx({
		get files() {
			return files;
		},
		get isDragging() {
			return isDragging;
		},
		get disabled() {
			return disabled;
		},
		get accept() {
			return accept;
		},
		get multiple() {
			return multiple;
		},
		get maxSize() {
			return maxSize;
		},
		get maxFiles() {
			return maxFiles;
		},
		setDragging,
		openFileDialog,
		addFiles,
		removeFile,
		clearFiles
	});
</script>

<input
	bind:this={inputEl}
	type="file"
	{accept}
	{multiple}
	{disabled}
	aria-hidden="true"
	tabindex="-1"
	class="file-upload-hidden-input"
	onchange={(e) => {
		const target = e.currentTarget as HTMLInputElement;
		if (target.files) {
			addFiles(target.files);
			target.value = '';
		}
	}}
/>

{@render children()}

<style>
	.file-upload-hidden-input {
		display: none;
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}
</style>
