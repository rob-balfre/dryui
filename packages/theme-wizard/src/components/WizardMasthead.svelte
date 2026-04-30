<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Text } from '@dryui/ui/text';
	import StepIndicator from './StepIndicator.svelte';

	interface Props extends HTMLAttributes<HTMLElement> {
		step: number;
		onstep?: (step: number) => void;
	}

	let { step, onstep, ...rest }: Props = $props();
</script>

<header data-wizard-masthead {...rest}>
	<Text size="lg" weight="semibold">Theme Wizard</Text>
	<StepIndicator currentStep={step} {...onstep ? { onstep } : {}} />
</header>

<style>
	[data-wizard-masthead] {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--dry-space-6);
		padding-block: var(--dry-space-4);
		padding-inline: var(--dry-space-6);
		border-block-end: 1px solid var(--dry-app-bar-border, var(--dry-color-stroke-weak));
		background: var(--dry-app-bar-bg, var(--dry-color-bg-base));
		box-shadow: var(--dry-app-bar-shadow, none);
		transition:
			border-color var(--dry-duration-normal, 0.3s) var(--dry-ease-out, ease),
			background var(--dry-duration-normal, 0.3s) var(--dry-ease-out, ease),
			box-shadow var(--dry-duration-normal, 0.3s) var(--dry-ease-out, ease);
	}
</style>
