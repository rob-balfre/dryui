<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Container } from '@dryui/ui';
	import { StepIndicator } from '@dryui/theme-wizard';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';

	const STEP_ROUTES: Record<number, string> = {
		1: '/theme-wizard',
		2: '/theme-wizard/colour',
		3: '/theme-wizard/typography',
		4: '/theme-wizard/shape',
		5: '/theme-wizard/preview'
	};

	interface Props {
		title: string;
		description: string;
		step: number;
		children: Snippet;
		previousHref?: string;
		previousLabel?: string;
		nextHref?: string;
		nextLabel?: string;
	}

	let {
		title,
		description,
		step,
		children,
		previousHref,
		previousLabel,
		nextHref,
		nextLabel
	}: Props = $props();
</script>

<Container size="xl">
	<div class="wizard-layout">
		<DocsPageHeader {title} {description}>
			{#snippet meta()}
				<StepIndicator
					currentStep={step}
					onstep={(nextStep) => {
						const href = STEP_ROUTES[nextStep];
						if (href) {
							goto(href);
						}
					}}
				/>
			{/snippet}
		</DocsPageHeader>

		{@render children()}

		{#if previousHref || nextHref}
			<nav class="wizard-actions" aria-label="Wizard navigation">
				{#if previousHref && previousLabel}
					<Button variant="ghost" onclick={() => goto(previousHref)}>{previousLabel}</Button>
				{/if}

				{#if nextHref && nextLabel}
					<Button variant="solid" onclick={() => goto(nextHref)}>{nextLabel}</Button>
				{/if}
			</nav>
		{/if}
	</div>
</Container>

<style>
	.wizard-layout {
		display: grid;
		gap: var(--dry-space-6);
		align-content: start;
	}

	.wizard-actions {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-3);
	}
</style>
