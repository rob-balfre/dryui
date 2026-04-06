<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Container } from '@dryui/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<svelte:head>
	<title>{title} — dryui</title>
</svelte:head>

<div class="view-layout">
	<div class="view-toolbar">
		<ThemeToggle />
	</div>
	<main class="view-content">
		<div class="view-container">
			<Container size="full">
				{@render children()}
			</Container>
		</div>
	</main>
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
	.view-layout {
		min-height: 100dvh;
		background: var(--dry-color-bg-base);
		color: var(--dry-color-text-strong);
	}
	.view-toolbar {
		position: fixed;
		top: var(--dry-space-3);
		right: var(--dry-space-3);
		z-index: 100;
	}
	.view-content {
		padding-block: var(--dry-space-8);
	}

	.view-container {
		display: grid;
		grid-template-columns: minmax(0, 1400px);
	}
</style>
