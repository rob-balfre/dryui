<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLButtonAttributes } from 'svelte/elements';
	import Toggle from '../toggle/toggle-button.svelte';
	import {
		createThemeController,
		type ThemeController,
		type ThemeMode
	} from './theme-controller.svelte.js';

	interface Props extends Omit<
		HTMLButtonAttributes,
		'onclick' | 'onkeydown' | 'disabled' | 'class'
	> {
		disabled?: boolean;
		class?: ClassValue;
		/**
		 * Storage key used to persist the explicit theme preference.
		 * Defaults to `'dryui-theme'`.
		 */
		storageKey?: string;
		/** Toggle size forwarded to the underlying Toggle. */
		size?: 'sm' | 'md' | 'lg';
		/**
		 * Optional pre-built controller. When provided, the component uses the
		 * shared state instead of creating its own. Useful if multiple toggles
		 * exist in the same app or if external code wants to read the mode.
		 */
		controller?: ThemeController;
		/** Accessible label. Defaults to `'Toggle theme'`. */
		'aria-label'?: string;
		/**
		 * Custom sun icon snippet. When omitted, a built-in inline SVG is used.
		 * The icon is shown when the current theme is light.
		 */
		sunIcon?: Snippet;
		/**
		 * Custom moon icon snippet. When omitted, a built-in inline SVG is used.
		 * The icon is shown when the current theme is dark.
		 */
		moonIcon?: Snippet;
		/**
		 * Called with the new mode after it is applied. Invoked for explicit
		 * picks via click or reset via Alt-click / Escape.
		 */
		onModeChange?: (mode: ThemeMode) => void;
	}

	let {
		storageKey,
		size = 'md',
		controller: externalController,
		'aria-label': ariaLabel = 'Toggle theme',
		sunIcon,
		moonIcon,
		onModeChange,
		title = 'Alt-click or press Escape to return to system theme',
		disabled,
		...rest
	}: Props = $props();

	// Read `externalController` and `storageKey` once at init time on purpose.
	// Swapping the controller or key after mount is not supported; this is an
	// init-time choice, so the linter warning about one-shot capture is expected.
	// svelte-ignore state_referenced_locally
	const controller = externalController ?? createThemeController({ storageKey });

	type ToggleClickEvent = Parameters<NonNullable<HTMLButtonAttributes['onclick']>>[0];
	type ToggleKeyEvent = Parameters<NonNullable<HTMLButtonAttributes['onkeydown']>>[0];

	function handleClick(event: ToggleClickEvent) {
		event.preventDefault();

		if (event.altKey) {
			controller.reset();
			onModeChange?.('system');
			return;
		}

		controller.cycle();
		onModeChange?.(controller.mode);
	}

	function handleKeydown(event: ToggleKeyEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		controller.reset();
		onModeChange?.('system');
	}

	const iconState = $derived(controller.isDark ? 'dark' : 'light');
</script>

<Toggle
	aria-label={ariaLabel}
	aria-keyshortcuts="Escape"
	pressed={controller.isDark}
	data-theme-switch="true"
	onclick={handleClick}
	onkeydown={handleKeydown}
	{disabled}
	{size}
	{title}
	{...rest}
>
	{#snippet icon()}
		<span class="icons" data-mode={iconState}>
			<span class="icon sun" aria-hidden="true">
				{#if sunIcon}
					{@render sunIcon()}
				{:else}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2" />
						<path d="M12 20v2" />
						<path d="m4.93 4.93 1.41 1.41" />
						<path d="m17.66 17.66 1.41 1.41" />
						<path d="M2 12h2" />
						<path d="M20 12h2" />
						<path d="m6.34 17.66-1.41 1.41" />
						<path d="m19.07 4.93-1.41 1.41" />
					</svg>
				{/if}
			</span>
			<span class="icon moon" aria-hidden="true">
				{#if moonIcon}
					{@render moonIcon()}
				{:else}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				{/if}
			</span>
		</span>
	{/snippet}
</Toggle>

<style>
	.icons {
		display: grid;
		place-items: center;
		color: var(--dry-theme-toggle-icon, currentColor);
	}

	.icon {
		grid-column: 1;
		grid-row: 1;
		display: grid;
		place-items: center;
	}

	.icon svg {
		display: block;
		block-size: var(--dry-theme-toggle-icon-size, 0.75rem);
		aspect-ratio: 1;
	}

	.icons[data-mode='dark'] .sun {
		display: none;
	}

	.icons[data-mode='light'] .moon {
		display: none;
	}
</style>
