<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SegmentedControl } from '@dryui/ui/segmented-control';
	import { Button } from '@dryui/ui/button';
	import { Text } from '@dryui/ui/text';
	import { getDerivedTheme, getAllTokens } from '../state.svelte';
	import { downloadCss, copyCss } from '../engine/export-css.js';

	let {
		preview,
		mode = 'light',
		onmodechange
	}: {
		preview?: Snippet;
		mode?: 'light' | 'dark';
		onmodechange?: (mode: 'light' | 'dark') => void;
	} = $props();

	let copyFeedback = $state('');
	const tokens = $derived(getAllTokens(mode));

	let sceneEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!sceneEl) return;
		const node = sceneEl;
		const applied = Object.entries(tokens);
		for (const [name, value] of applied) {
			node.style.setProperty(name, value);
		}
		return () => {
			for (const [name] of applied) {
				node.style.removeProperty(name);
			}
		};
	});

	function handleDownload() {
		downloadCss(getDerivedTheme());
	}

	async function handleCopyCss() {
		await copyCss(getDerivedTheme());
		copyFeedback = 'Copied!';
		setTimeout(() => (copyFeedback = ''), 2000);
	}
</script>

<section class="preview-section">
	<div class="preview-header">
		<SegmentedControl.Root value={mode}>
			<SegmentedControl.Item value="light" onclick={() => onmodechange?.('light')}>
				Light
			</SegmentedControl.Item>
			<SegmentedControl.Item value="dark" onclick={() => onmodechange?.('dark')}>
				Dark
			</SegmentedControl.Item>
		</SegmentedControl.Root>

		<div class="export-actions">
			<Button variant="solid" size="sm" onclick={handleDownload}>Download CSS</Button>
			<Button variant="outline" size="sm" onclick={handleCopyCss}>
				{copyFeedback || 'Copy CSS'}
			</Button>
		</div>
	</div>

	<div bind:this={sceneEl} class="preview-scene" data-mode={mode}>
		{#if preview}
			{@render preview()}
		{:else}
			<Text as="p" size="sm" color="muted">No preview available.</Text>
		{/if}
	</div>
</section>

<style>
	.preview-section {
		display: grid;
		gap: var(--dry-space-5);
		container-type: inline-size;
	}

	.preview-header {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.export-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		justify-self: end;
	}

	.preview-scene {
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-lg);
		border: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-base);
		color: var(--dry-color-text-strong);
	}

	@container (max-width: 36rem) {
		.preview-header {
			grid-template-columns: 1fr;
			gap: var(--dry-space-3);
		}

		.export-actions {
			justify-self: start;
		}
	}
</style>
