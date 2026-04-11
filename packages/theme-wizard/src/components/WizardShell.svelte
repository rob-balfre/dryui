<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useThemeOverride } from '@dryui/primitives/use-theme-override';
	import { Text } from '@dryui/ui/text';
	import { Button } from '@dryui/ui/button';
	import { getAllTokens, wizardState } from '../state.svelte.js';
	import StepIndicator from './StepIndicator.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		step: number;
		children: Snippet;
		onback?: () => void;
		onnext?: () => void;
		nextLabel?: string;
		backLabel?: string;
		onstep?: (step: number) => void;
	}

	let {
		title,
		subtitle,
		step,
		children,
		onback,
		onnext,
		nextLabel = 'Next',
		backLabel = 'Back',
		onstep
	}: Props = $props();

	useThemeOverride(() => getAllTokens());
</script>

<div class="wizard-shell">
	<header class="wizard-header">
		<div class="wizard-header-inner">
			<Text size="lg" weight="semibold">Theme Wizard</Text>
			<StepIndicator currentStep={step} {...onstep ? { onstep } : {}} />
		</div>
	</header>

	<main class="wizard-main">
		<div class="wizard-content">
			<div class="wizard-title">
				<span class="wizard-step-heading">{title}</span>
				{#if subtitle}
					<Text as="p" color="muted">{subtitle}</Text>
				{/if}
			</div>

			{@render children()}
		</div>
	</main>

	<footer class="wizard-footer">
		<div class="wizard-footer-inner">
			{#if onback}
				<Button variant="ghost" onclick={onback}>&larr; {backLabel}</Button>
			{/if}
			{#if onnext}
				<Button variant="solid" onclick={onnext}>{nextLabel} &rarr;</Button>
			{/if}
		</div>
	</footer>
</div>

<style>
	.wizard-shell {
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: 100dvh;
		color: var(--dry-color-text-strong);
		background-color: var(--dry-color-bg-base);
		transition: background-color 0.4s ease;
	}

	.wizard-header {
		display: grid;
		grid-template-columns: minmax(0, 64rem);
		justify-content: center;
		padding: var(--dry-space-4) var(--dry-space-6);
		border-bottom: 1px solid var(--dry-app-bar-border, var(--dry-color-stroke-weak));
		background: var(--dry-app-bar-bg, var(--dry-color-bg-base));
		box-shadow: var(--dry-app-bar-shadow, none);
		transition:
			border-color 0.3s ease,
			background 0.3s ease,
			box-shadow 0.3s ease;
	}

	.wizard-header-inner {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--dry-space-6);
	}

	.wizard-main {
		display: grid;
		grid-template-columns: minmax(0, 48rem);
		justify-content: center;
		align-content: start;
		padding: var(--dry-space-10) var(--dry-space-6);
		overflow-y: auto;
	}

	.wizard-content {
		display: grid;
		gap: var(--dry-space-10);
	}

	.wizard-title {
		display: grid;
		gap: var(--dry-space-3);
	}

	.wizard-step-heading {
		font-family: var(--dry-font-mono);
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		letter-spacing: 0.02em;
	}

	.wizard-footer {
		display: grid;
		grid-template-columns: minmax(0, 48rem);
		justify-content: center;
		padding: var(--dry-space-4) var(--dry-space-6);
		border-top: 1px solid var(--dry-app-bar-border, var(--dry-color-stroke-weak));
		transition: border-color 0.3s ease;
	}

	.wizard-footer-inner {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-3);
	}
</style>
