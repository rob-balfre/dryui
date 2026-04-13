<script lang="ts">
	import { browser } from '$app/environment';
	import { Toggle } from '@dryui/ui';
	import { Sun, Moon } from 'lucide-svelte';
	import { isDarkTheme, resetThemePreference, toggleTheme } from '$lib/theme.svelte.js';

	let darkTheme = $state(browser ? isDarkTheme() : false);

	function handleClick(event: MouseEvent) {
		event.preventDefault();

		if (event.altKey) {
			resetThemePreference();
		} else {
			toggleTheme();
		}

		darkTheme = isDarkTheme();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') {
			return;
		}

		event.preventDefault();
		resetThemePreference();
		darkTheme = isDarkTheme();
	}
</script>

<Toggle
	aria-label="Toggle theme"
	aria-keyshortcuts="Escape"
	pressed={darkTheme}
	data-theme-switch="true"
	onclick={handleClick}
	onkeydown={handleKeydown}
	size="md"
	title="Alt-click or press Escape to return to system theme"
>
	{#snippet icon()}
		<span class="theme-icon-sun" aria-hidden="true">
			<Sun size={12} />
		</span>
		<span class="theme-icon-moon" aria-hidden="true">
			<Moon size={12} />
		</span>
	{/snippet}
</Toggle>

<style>
	.theme-icon-sun {
		display: var(--docs-theme-icon-sun-display, inline-grid);
	}

	.theme-icon-moon {
		display: var(--docs-theme-icon-moon-display, none);
	}
</style>
