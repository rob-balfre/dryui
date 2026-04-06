<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, onclick, ...rest }: Props = $props();

	const ctx = getFileUploadCtx();

	let dragCounter = $state(0);

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		if (ctx.disabled) return;
		dragCounter++;
		if (dragCounter === 1) ctx.setDragging(true);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (ctx.disabled) return;
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'copy';
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		if (ctx.disabled) return;
		dragCounter--;
		if (dragCounter <= 0) {
			dragCounter = 0;
			ctx.setDragging(false);
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (ctx.disabled) return;
		dragCounter = 0;
		ctx.setDragging(false);
		if (e.dataTransfer?.files) {
			ctx.addFiles(e.dataTransfer.files);
		}
	}

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		ctx.openFileDialog();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	role="button"
	tabindex={ctx.disabled ? undefined : 0}
	data-dragging={ctx.isDragging || undefined}
	data-disabled={ctx.disabled || undefined}
	class={className}
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			ctx.openFileDialog();
		}
	}}
	{...rest}
>
	{@render children()}
</div>
