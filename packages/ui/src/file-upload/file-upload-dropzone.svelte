<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, class: className, onclick, size = 'md', ...rest }: Props = $props();

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
	data-fu-dropzone
	data-size={size}
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

<style>
	[data-fu-dropzone] {
		--dry-fu-border: var(--dry-color-stroke-strong);
		--dry-fu-bg: var(--dry-color-fill-weaker);
		--dry-fu-padding: var(--dry-space-6);
		--dry-fu-min-height: 120px;
		--dry-fu-font-size: var(--dry-type-small-size);

		display: grid;
		place-items: center;
		gap: var(--dry-space-2);
		min-height: var(--dry-fu-min-height);
		padding: var(--dry-fu-padding);
		font-size: var(--dry-fu-font-size);
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-weak);
		background: var(--dry-fu-bg);
		border: 2px dashed var(--dry-fu-border);
		border-radius: var(--dry-fu-radius, var(--dry-radius-xl));
		cursor: pointer;
		text-align: center;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-fu-dropzone]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
		--dry-fu-border: var(--dry-color-focus-ring);
	}

	[data-fu-dropzone][data-dragging] {
		--dry-fu-border: var(--dry-color-fill-brand);
		--dry-fu-bg: color-mix(in srgb, var(--dry-color-fill-brand) 8%, transparent);
		color: var(--dry-color-fill-brand);
	}

	[data-fu-dropzone][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-fu-dropzone][data-size='sm'] {
		--dry-fu-padding: var(--dry-space-4);
		--dry-fu-min-height: 80px;
		--dry-fu-font-size: var(--dry-type-tiny-size);
	}

	[data-fu-dropzone][data-size='lg'] {
		--dry-fu-padding: var(--dry-space-8);
		--dry-fu-min-height: 160px;
		--dry-fu-font-size: var(--dry-type-heading-4-size);
	}

	@container (max-width: 300px) {
		[data-fu-dropzone] {
			--dry-fu-padding: var(--dry-space-4);
			--dry-fu-min-height: 80px;
		}
	}
</style>
