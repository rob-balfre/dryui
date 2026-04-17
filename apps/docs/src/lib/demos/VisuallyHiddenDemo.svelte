<script lang="ts">
	import { Button, Heading, Text, VisuallyHidden } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';

	const viewModes = ['Standard', 'Focus', 'Notes'] as const;

	let playing = $state(false);
	let bookmarked = $state(false);
	let viewModeIndex = $state(0);
	let lastAction = $state('Ready. Press an icon-only control to update the demo.');

	function togglePlayback() {
		playing = !playing;
		lastAction = playing ? 'Playback started.' : 'Playback paused.';
	}

	function toggleBookmark() {
		bookmarked = !bookmarked;
		lastAction = bookmarked ? 'Article bookmarked.' : 'Bookmark removed.';
	}

	function cycleViewMode() {
		viewModeIndex = (viewModeIndex + 1) % viewModes.length;
		lastAction = `Reader mode set to ${viewModes[viewModeIndex]}.`;
	}
</script>

<DocsDemo gap="lg">
	{#snippet header()}
		<div class="demo-copy">
			<Text as="p" size="sm" color="secondary">Common use case</Text>
			<Heading level={3}>Icon-only controls with real text labels</Heading>
			<Text as="p" size="sm" color="secondary">
				<code>VisuallyHidden</code> keeps the visible UI minimal while giving each control a spoken name
				in the accessibility tree.
			</Text>
		</div>
	{/snippet}

	<div class="actions" role="group" aria-label="Icon-only button examples">
		<Button
			variant={playing ? 'solid' : 'outline'}
			size="sm"
			aria-pressed={playing}
			onclick={togglePlayback}
		>
			<span class="icon" aria-hidden="true">
				{#if playing}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
						<path
							d="M5.5 4v8M10.5 4v8"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-width="1.5"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
						<path
							d="M5 3.75v8.5L11.75 8 5 3.75Z"
							stroke="currentColor"
							stroke-linejoin="round"
							stroke-width="1.5"
						/>
					</svg>
				{/if}
			</span>
			<VisuallyHidden>{playing ? 'Pause episode' : 'Play episode'}</VisuallyHidden>
		</Button>

		<Button
			variant={bookmarked ? 'solid' : 'outline'}
			size="sm"
			aria-pressed={bookmarked}
			onclick={toggleBookmark}
		>
			<span class="icon" aria-hidden="true">
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
					<path
						d="M5 3.5h6v9l-3-2-3 2v-9Z"
						stroke="currentColor"
						stroke-linejoin="round"
						stroke-width="1.5"
					/>
				</svg>
			</span>
			<VisuallyHidden>{bookmarked ? 'Remove bookmark' : 'Bookmark article'}</VisuallyHidden>
		</Button>

		<Button variant="outline" size="sm" onclick={cycleViewMode}>
			<span class="icon" aria-hidden="true">
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
					<path
						d="M8 2.75v1.5M8 11.75v1.5M12.25 8h1.5M2.25 8h1.5M11.01 4.99l1.06-1.06M3.93 12.07l1.06-1.06M11.01 11.01l1.06 1.06M3.93 3.93l1.06 1.06M10.25 8a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
					/>
				</svg>
			</span>
			<VisuallyHidden>Change reader mode</VisuallyHidden>
		</Button>
	</div>

	<div class="preview">
		<div class="preview-copy">
			<Text as="p" size="sm" weight="semibold">Live demo state</Text>
			<Text as="p" size="sm" color="secondary">
				The controls above are still icon-only, but they now update visible state so the example
				behaves like a real toolbar.
			</Text>
		</div>

		<div class="preview-list">
			<div class="preview-row">
				<Text as="span" size="sm" weight="medium">Playback</Text>
				<Text as="span" size="sm" color="secondary">{playing ? 'Playing now' : 'Paused'}</Text>
			</div>

			<div class="preview-row">
				<Text as="span" size="sm" weight="medium">Saved</Text>
				<Text as="span" size="sm" color="secondary"
					>{bookmarked ? 'Bookmarked for later' : 'Not saved yet'}</Text
				>
			</div>

			<div class="preview-row">
				<Text as="span" size="sm" weight="medium">Reader mode</Text>
				<Text as="span" size="sm" color="secondary">{viewModes[viewModeIndex]}</Text>
			</div>

			<div class="preview-row">
				<Text as="span" size="sm" weight="medium">Screen reader labels</Text>
				<div class="label-list">
					<span class="label-chip">{playing ? 'Pause episode' : 'Play episode'}</span>
					<span class="label-chip">{bookmarked ? 'Remove bookmark' : 'Bookmark article'}</span>
					<span class="label-chip">Change reader mode</span>
				</div>
			</div>

			<div class="preview-row" aria-live="polite">
				<Text as="span" size="sm" weight="medium">Last action</Text>
				<Text as="span" size="sm" color="secondary">{lastAction}</Text>
			</div>
		</div>
	</div>
</DocsDemo>

<style>
	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}

	.demo-copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	.icon {
		display: grid;
		place-items: center;
		color: var(--dry-color-text-strong);
	}

	svg {
		display: block;
		block-size: 1rem;
		aspect-ratio: 1;
	}

	.preview {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
	}

	.preview-copy,
	.preview-list {
		display: grid;
		gap: var(--dry-space-3);
	}

	.preview-row {
		display: grid;
		gap: var(--dry-space-2);
		padding-bottom: var(--dry-space-3);
		border-bottom: 1px solid var(--dry-color-stroke-weak);
	}

	.preview-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}

	.label-list {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: start;
	}

	.label-chip {
		display: grid;
		padding: var(--dry-space-1) var(--dry-space-2);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-sm);
		background: var(--dry-color-bg-base);
		color: var(--dry-color-text-weak);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}
</style>
