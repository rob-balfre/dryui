<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import VisualBenchmarkScene from '$lib/benchmarks/VisualBenchmarkScene.svelte';
	import { applyVisualBenchmarkTheme, restoreVisualBenchmarkTheme } from '$lib/benchmarks/theme';
	import '../../../../app.css';

	if (browser) {
		applyVisualBenchmarkTheme();
	}

	onDestroy(() => {
		if (browser) {
			restoreVisualBenchmarkTheme();
		}
	});
</script>

<svelte:head>
	<title>Visual Benchmark — DryUI</title>
	<meta name="robots" content="noindex,nofollow" />
	<script>
		(() => {
			const root = document.documentElement;
			if (!root.hasAttribute('data-dryui-benchmark-previous-class')) {
				root.setAttribute('data-dryui-benchmark-previous-class', root.className);
				root.setAttribute(
					'data-dryui-benchmark-had-theme',
					root.hasAttribute('data-theme') ? '1' : '0'
				);
				const previousTheme = root.getAttribute('data-theme');
				if (previousTheme !== null) {
					root.setAttribute('data-dryui-benchmark-previous-theme', previousTheme);
				} else {
					root.removeAttribute('data-dryui-benchmark-previous-theme');
				}
			}
			root.classList.remove('theme-auto', 'theme-dark', 'theme-light');
			root.classList.add('theme-light');
			root.setAttribute('data-theme', 'light');
		})();
	</script>
</svelte:head>

<VisualBenchmarkScene />
