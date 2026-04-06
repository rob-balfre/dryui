<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		accept?: string;
		onDrop?: (files: File[]) => void;
		children?: Snippet;
	}

	let { accept, onDrop: onDropHandler, class: className, children, ...rest }: Props = $props();

	let dragActive = $state(false);
	let dragCounter = $state(0);

	function onDragEnter(e: DragEvent) {
		e.preventDefault();
		dragCounter++;
		dragActive = true;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDragLeave() {
		dragCounter--;
		if (dragCounter <= 0) {
			dragCounter = 0;
			dragActive = false;
		}
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragCounter = 0;
		dragActive = false;
		const files = Array.from(e.dataTransfer?.files ?? []);
		if (accept) {
			const types = accept.split(',').map((t) => t.trim());
			const filtered = files.filter((f) =>
				types.some((t) =>
					t.startsWith('.') ? f.name.endsWith(t) : f.type.startsWith(t.replace('/*', '/'))
				)
			);
			onDropHandler?.(filtered);
		} else {
			onDropHandler?.(files);
		}
	}
</script>

<div
	data-drop-zone
	data-active={dragActive || undefined}
	role="region"
	class={className}
	ondragenter={onDragEnter}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	ondrop={onDrop}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-drop-zone-text>Drop files here</span>
	{/if}
</div>

<style>
	[data-drop-zone] {
		padding: var(--dry-space-6) var(--dry-space-8);
		border: 1px dashed var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		text-align: center;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
		cursor: default;
	}

	[data-drop-zone][data-active] {
		border-color: var(--dry-color-stroke-strong);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 5%, transparent);
	}

	[data-drop-zone-text] {
		font-size: var(--dry-type-small-size);
		color: var(--dry-color-text-weak);
	}
</style>
