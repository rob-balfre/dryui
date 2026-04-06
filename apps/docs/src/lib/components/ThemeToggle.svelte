<script lang="ts">
	import { onMount } from 'svelte';
	import { Toggle } from '@dryui/ui';
	import { Sun, Moon } from 'lucide-svelte';
	import { isDarkTheme, resetThemePreference, toggleTheme } from '$lib/theme.svelte.js';

	let hydrated = $state(false);
	let darkTheme = $derived(isDarkTheme());

	onMount(() => {
		hydrated = true;
	});

	function handleToggleClick(event: MouseEvent) {
		event.preventDefault();

		if (event.altKey) {
			resetThemePreference();
			return;
		}

		toggleTheme();
	}

	function handleToggleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') {
			return;
		}

		event.preventDefault();
		resetThemePreference();
	}
</script>

<span class="theme-toggle">
	{#if hydrated}
		<Toggle
			aria-label={darkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
			aria-keyshortcuts="Escape"
			pressed={darkTheme}
			onclick={handleToggleClick}
			onkeydown={handleToggleKeydown}
			size="md"
			title="Alt-click or press Escape to return to system theme"
		>
			{#snippet icon()}
				{#if darkTheme}
					<Moon size={12} />
				{:else}
					<Sun size={12} />
				{/if}
			{/snippet}
		</Toggle>
	{:else}
		<span class="placeholder" aria-hidden="true"></span>
	{/if}
</span>

<style>
	.theme-toggle {
		display: inline-grid;
		grid-auto-flow: column;
		grid-template-columns: minmax(64px, auto);
		align-items: center;
		justify-items: center;
		min-block-size: 32px;
	}

	.placeholder {
		display: grid;
		grid-template-columns: minmax(0, 64px);
		block-size: 32px;
	}
</style>
