<script lang="ts">
	import { browser } from '$app/environment';
	import { Feedback, COMPONENT_NAMES } from '@dryui/feedback';
	import { onMount } from 'svelte';
	import '../../../app.css';

	onMount(() => {
		document.documentElement.classList.remove('theme-light', 'theme-auto');
		document.documentElement.classList.add('theme-dark');
		document.documentElement.setAttribute('data-theme', 'dark');
		(
			window as Window & {
				__feedbackBoundsTest?: { COMPONENT_NAMES: readonly string[] };
			}
		).__feedbackBoundsTest = { COMPONENT_NAMES };
	});
</script>

<svelte:head>
	<title>Feedback Bounds Audit</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#if browser}
	<Feedback />
{/if}

<main class="audit-canvas">
	<h1>Feedback Bounds Audit</h1>
	<p>Driven from a Playwright spec.</p>
</main>

<style>
	.audit-canvas {
		min-block-size: 100vh;
		padding: 60px;
		background: var(--dry-color-bg-base, hsl(225 15% 7%));
		color: var(--dry-color-text-strong, hsl(220 10% 92%));
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.audit-canvas h1 {
		margin: 0 0 8px;
		font-size: 24px;
	}

	.audit-canvas p {
		margin: 0;
		opacity: 0.6;
	}
</style>
