<script lang="ts">
	import { Stepper } from '@dryui/ui/stepper';

	interface Props {
		currentStep?: number;
		onstep?: (step: number) => void;
	}

	let { currentStep = 1, onstep }: Props = $props();

	let navEl = $state<HTMLElement | null>(null);

	const STEPS = [
		{ n: 1, label: 'Personality' },
		{ n: 2, label: 'Brand' },
		{ n: 3, label: 'Typography' },
		{ n: 4, label: 'Shape' },
		{ n: 5, label: 'Preview' }
	];

	// Stepper uses 0-based indexing; wizard uses 1-based
	let activeStepIndex = $derived(currentStep - 1);

	function handleStepClick(index: number) {
		onstep?.(index + 1);
	}

	$effect(() => {
		currentStep;

		if (!navEl) return;

		requestAnimationFrame(() => {
			const activeStep = navEl?.querySelector(
				"[aria-current='step'] [data-part='indicator-button']"
			);
			if (activeStep instanceof HTMLElement) {
				activeStep.scrollIntoView({
					block: 'nearest',
					inline: 'center'
				});
			}
		});
	});
</script>

<nav bind:this={navEl} class="wizard-stepper" aria-label="Wizard steps">
	<Stepper.Root activeStep={activeStepIndex}>
		<Stepper.List>
			{#each STEPS as step, i (step.n)}
				{#if i > 0}
					<Stepper.Separator step={i} />
				{/if}
				<Stepper.Step step={i} clickable onclick={handleStepClick}>
					{step.label}
				</Stepper.Step>
			{/each}
		</Stepper.List>
	</Stepper.Root>
</nav>

<style>
	.wizard-stepper {
		container-type: inline-size;
		overflow-x: auto;
		padding-bottom: var(--dry-space-1);
		scrollbar-width: none;
		display: grid;
		grid-template-columns: max-content;
	}

	.wizard-stepper::-webkit-scrollbar {
		display: none;
	}

	@container (max-width: 30rem) {
		.wizard-stepper {
			--dry-stepper-gap: var(--dry-space-1);
			--dry-stepper-indicator-size: 0.875rem;
		}

		/* Child internals need a narrow-screen override to keep labels readable. */
		.wizard-stepper :global([data-part='step']) {
			font-size: 0.75rem;
		}
	}
</style>
